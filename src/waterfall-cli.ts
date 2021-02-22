// Dependencies
import chalk from './chalk';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import deepmerge from 'deepmerge';
import defaultSettings from './default-settings';
import ErrorWithoutStack from './error-without-stack';
import screens from './screens';
import { Settings } from './types';
import utils from './utils';
import printPrettyError from './print-pretty-error';

// Handle exceptions
process.on('uncaughtException', (error: Error) => {
	if (error.stack) {
		printPrettyError(error.stack);
	}
	process.exit(1);
});

// The constructor, for use at the entry point
export function init(customSettings: Partial<Settings>) {
	// Merge custom settings into default settings
	const settings = deepmerge(defaultSettings, customSettings);

	// Add spacing before
	for (let i = 0; i < settings.spacing.before; i += 1) {
		console.log();
	}

	// Determine app information
	settings.app = utils(settings).retrieveAppInformation();

	// Verbose output
	utils(settings).verboseLog(`Set app name to: ${settings.app.name}`);
	utils(settings).verboseLog(`Set app version to: ${settings.app.version}`);

	// Organize the arguments
	const organizedArguments = utils(settings).organizeArguments();

	// Handle --version
	if (organizedArguments.flags.includes('version')) {
		// Output
		process.stdout.write(screens(settings).version());

		// Verbose output
		utils(settings).verboseLog('Skipping further processing...');

		// Stop processing
		return;
	}

	// Handle --help
	if (organizedArguments.flags.includes('help') || settings.arguments.length === 0) {
		// Output
		process.stdout.write(screens(settings).help());

		// Verbose output
		utils(settings).verboseLog('Skipping further processing...');

		// Stop processing
		return;
	}

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
			utils(settings).verboseLog(`Created directory: ${appVersionsDirectory}`);
		}

		// Warning message
		if (fs.existsSync(pathToLatestVersion)) {
			// Get values
			const latestVersion = semver.clean(`${fs.readFileSync(pathToLatestVersion)}`);
			const currentVersion = semver.clean(settings.app.version || '');

			// Only continue if we have both
			if (latestVersion && currentVersion) {
				const bothVersionsAreValid = semver.valid(latestVersion) && semver.valid(currentVersion);

				// Verbose ouput
				utils(settings).verboseLog(`Previously retrieved latest app version: ${latestVersion}`);
				utils(settings).verboseLog(`Cleaned-up current app version: ${currentVersion}`);
				utils(settings).verboseLog(`Both versions are valid: ${bothVersionsAreValid ? 'yes' : 'no'}`);

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

	// Form execution paths
	const executionPaths: string[] = [];
	let currentPathPrefix = path.dirname(settings.mainFilename);
	const commandPieces = organizedArguments.command.trim().split(' ');

	commandPieces.forEach((command, index) => {
		// Update current path prefix
		currentPathPrefix = path.join(currentPathPrefix, command);

		// Get the command path
		const commandPath = path.join(currentPathPrefix, `${command}.js`);

		// Get the command spec
		const spec = utils(settings).files.getCommandSpec(currentPathPrefix);

		// Push onto array, if needed
		if (index === commandPieces.length - 1 || spec.executeOnCascade === true) {
			executionPaths.push(commandPath);
		}
	});

	// Construct the input object
	const inputObject = utils(settings).constructInputObject(organizedArguments);

	// Verbose output
	utils(settings).verboseLog(`Constructed input: ${JSON.stringify(inputObject)}`);

	// Call onStart() function, if any
	if (settings.onStart) {
		settings.onStart(inputObject);
	}

	// Execute each path sequentially, starting with the first
	const executePath = (paths: string[]) => {
		// Stop if none
		if (paths.length === 0) {
			return;
		}

		// Verbose output
		utils(settings).verboseLog(`Executing: ${paths[0]}\n`);

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
				// Add spacing after
				for (let i = 0; i < settings.spacing.after; i += 1) {
					console.log();
				}
			}
		});

		// Handle error
		child.on('error', (error: Error) => {
			throw new Error(error.toString().replace(/^Error: /i, ''));
		});
	};

	executePath(executionPaths);
}

// The function used to kick off commands
export function parse() {
	return JSON.parse(process.argv[2]);
}
