// Imports
import helpScreen from '../screens/help.js';
import versionScreen from '../screens/version.js';
import { PrintableError } from '../utils/errors.js';
import getConfig, { Config } from '../utils/get-config.js';
import getContext from '../utils/get-context.js';
import getOrganizedArguments from '../utils/get-organized-arguments.js';
import printPrettyError from '../utils/print-pretty-error.js';
import verboseLog from '../utils/verbose-log.js';
import path from 'path';
import getCommandSpec from '../utils/get-command-spec.js';
import constructInputObject from '../utils/construct-input-object.js';
import chalk from '../utils/chalk.js';

/** The initialization point, which should be called at the root of your CLI app */
export default async function init(customConfig: Partial<Config>): Promise<void> {
	// Wrap in a try/catch
	try {
		// Get the context/config
		const context = await getContext();
		const config = await getConfig(customConfig);

		// Add spacing before
		for (let i = 0; i < config.spacing.before; i += 1) {
			console.log();
		}

		// Verbose output
		await verboseLog(`Determined config to be: ${JSON.stringify(config)}`);

		// Organize the arguments
		const organizedArguments = await getOrganizedArguments();

		// Handle --version
		if (organizedArguments.flags.includes('version')) {
			// Output
			process.stdout.write(await versionScreen());

			// Verbose output
			await verboseLog('Skipping further processing...');

			// Stop processing
			return;
		}

		// Handle --help
		if (organizedArguments.flags.includes('help') || context.standardizedArguments.length === 0) {
			// Output
			process.stdout.write(await helpScreen());

			// Verbose output
			await verboseLog('Skipping further processing...');

			// Stop processing
			return;
		}

		/*
		// Handle new version warning
		if (settings.newVersionWarning.enabled && settings.app.packageName) {
			// Determine where to store the version
			const pathToLatestVersion = path.join(
				__dirname,
				`../app-versions/${settings.app.packageName.replace(/[^a-zA-Z0-9-.]/g, '=')}`
			);

			// Make the directory
			const appVersionsDirectory = path.dirname(pathToLatestVersion);

			if (!fs.existsSync(appVersionsDirectory)) {
				fs.mkdirSync(appVersionsDirectory);
				await verboseLog(`Created directory: ${appVersionsDirectory}`);
			}

			// Warning message
			if (fs.existsSync(pathToLatestVersion)) {
				// Get values
				const latestVersion = semver.clean(`${fs.readFileSync(pathToLatestVersion)}`);
				const currentVersion = semver.clean(settings.app.version || '');

				// Only continue if we have both
				if (latestVersion && currentVersion) {
					const bothVersionsAreValid = semver.valid(latestVersion) && semver.valid(currentVersion);

					// Verbose output
					await verboseLog(`Previously retrieved latest app version: ${latestVersion}`);
					await verboseLog(`Cleaned-up current app version: ${currentVersion}`);
					await verboseLog(`Both versions are valid: ${bothVersionsAreValid ? 'yes' : 'no'}`);

					// Determine if warning is needed
					if (bothVersionsAreValid && semver.gt(latestVersion, currentVersion)) {
						console.log(
							chalk.yellow(
								`You're using an outdated version of ${
									settings.app.name
								} (${currentVersion}). The latest version is ${chalk.bold(latestVersion)}`
							)
						);
						console.log(
							`${chalk.yellow(
								`  > Upgrade by running: ${chalk.bold(
									`npm install ${settings.newVersionWarning.installedGlobally ? '--global ' : ''}${
										settings.app.packageName
									}@${latestVersion}`
								)}`
							)}\n`
						);
					}
				}
			}

			// Check asynchronously if there's a new published version
			const versionCheck = spawn('npm', ['view', settings.app.packageName, 'version']);

			versionCheck.stdout.on('data', (stdout: string) => {
				fs.writeFile(pathToLatestVersion, semver.clean(`${stdout}`) ?? '', 'utf8', () => {
					// Do nothing
				});
			});
		}
		*/

		// Form command paths
		const commandPaths: string[] = [];
		let currentPathPrefix = path.dirname(context.entryFile);
		const commandPieces = organizedArguments.command.trim().split(' ');

		for (const [index, command] of commandPieces.entries()) {
			// Update current path prefix
			currentPathPrefix = path.join(currentPathPrefix, command);

			// Get the command path
			const commandPath = path.join(currentPathPrefix, `${command}.js`);

			// Get the command spec
			const spec = await getCommandSpec(currentPathPrefix);

			// Push onto array, if needed
			if (index === commandPieces.length - 1 || spec.executeOnCascade === true) {
				commandPaths.push(commandPath);
			}
		}

		// Construct the input object
		const inputObject = await constructInputObject();

		// Verbose output
		await verboseLog(`Constructed input: ${JSON.stringify(inputObject)}`);

		// Call onStart() function, if any
		if (config.onStart) {
			config.onStart(inputObject);
		}

		// Run each command path sequentially, starting with the first
		for (const commandPath of commandPaths) {
			// Initialize
			// TODO: Use real type
			type Command = () => Promise<void>;
			let command: Command | undefined = undefined;
			const truncatedPath = commandPath.replace(`${path.dirname(context.entryFile)}/`, '');

			// Wrap in try/catch
			try {
				// Import it
				const importedCommand = (await import(commandPath)) as { default: Command } | Command;
				command = 'default' in importedCommand ? importedCommand.default : importedCommand;
			} catch (error: unknown) {
				// Let outer try/catch handle printable errors
				if (error instanceof PrintableError) {
					throw error;
				}

				throw new PrintableError(
					`${String(error)}\n\nEncountered this error while importing the command at: ${chalk.bold(truncatedPath)}`
				);
			}

			// Wrap in try/catch
			try {
				// TODO: Give it input object
				await command();
			} catch (error: unknown) {
				// Let outer try/catch handle printable errors
				if (error instanceof PrintableError) {
					throw error;
				}

				throw new PrintableError(
					`${String(error)}\n\nEncountered this error while running the command at: ${chalk.bold(truncatedPath)}`
				);
			}
		}

		// Add spacing after
		for (let i = 0; i < config.spacing.after; i += 1) {
			console.log();
		}
		/*
		const executePath = async (paths: string[]) => {
			// Stop if none
			if (paths.length === 0) {
				return;
			}

			// Verbose output
			await verboseLog(`Executing: ${paths[0]}\n`);

			// Spawn child
			const child = spawn('node', [paths[0], JSON.stringify(inputObject)], {
				stdio: 'inherit',
			});

			// Wait for exit
			child.on('exit', (code: number) => {
				// Handle a SIGKILL
				if (code === null) {
					console.log(); // Ensure it goes to the next line
					process.exit();
				}

				// Handle as already handled, prevent display
				if (code === 254) {
					process.exit(254);
				}

				// Handle if error message already happened, propagate as code 1
				if (code === 255) {
					process.exit(1);
				}

				// Handle an issue
				if (code !== 0) {
					throw new ErrorWithoutStack(`Received exit code ${code} from: ${paths[0]}\nSee above output`);
				}

				// Run next path, if one exists
				if (paths[1]) {
					executePath(paths.slice(1));
				} else {
					
				}
			});

			// Handle error
			child.on('error', (error: Error) => {
				throw new Error(error.toString().replace(/^Error: /i, ''));
			});
		};

		await executePath(commandPaths);
		*/
	} catch (error: unknown) {
		if (error instanceof PrintableError) {
			// Print the error
			printPrettyError(error.message);

			// Get the config
			const config = await getConfig(customConfig);

			// Add spacing after
			for (let i = 0; i < config.spacing.after; i += 1) {
				console.log();
			}

			// Exit with error code
			process.exit(1);
		}

		throw error;
	}
}
