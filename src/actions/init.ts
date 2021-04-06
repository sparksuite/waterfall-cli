// Imports
import helpScreen from '../screens/help.js';
import versionScreen from '../screens/version.js';
import { HandledError, PrintableError } from '../utils/errors.js';
import getConfig, { Config } from '../utils/get-config.js';
import getContext from '../utils/get-context.js';
import getOrganizedArguments from '../utils/get-organized-arguments.js';
import printPrettyError from '../utils/print-pretty-error.js';
import verboseLog from '../utils/verbose-log.js';
import path from 'path';
import getCommandSpec, { EmptyCommandInput } from '../utils/get-command-spec.js';
import constructInputObject from '../utils/construct-input-object.js';
import chalk from '../utils/chalk.js';
import CommandFunction from '../types/command-function.js';

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
			console.log(await versionScreen());

			// Add spacing after
			for (let i = 0; i < config.spacing.after; i += 1) {
				console.log();
			}

			// Verbose output
			await verboseLog('Skipping further processing...');

			// Stop processing
			return;
		}

		// Handle --help
		if (organizedArguments.flags.includes('help') || context.standardizedArguments.length === 0) {
			// Output
			console.log(await helpScreen());

			// Add spacing after
			for (let i = 0; i < config.spacing.after; i += 1) {
				console.log();
			}

			// Verbose output
			await verboseLog('Skipping further processing...');

			// Stop processing
			return;
		}

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
			await config.onStart(inputObject);
		}

		// Run each command path sequentially, starting with the first
		for (const commandPath of commandPaths) {
			// Initialize
			let command: CommandFunction<EmptyCommandInput> | undefined = undefined;
			const truncatedPath = commandPath.replace(`${path.dirname(context.entryFile)}/`, '');

			// Import it within a try/catch
			try {
				const importedCommand = (await import(commandPath)) as
					| { default: CommandFunction<EmptyCommandInput> }
					| CommandFunction<EmptyCommandInput>;
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

			// Verify it's a function
			if (typeof command !== 'function') {
				throw new PrintableError(`This command doesn’t export a function: ${chalk.bold(truncatedPath)}`);
			}

			// Wrap in try/catch
			try {
				await command(inputObject);
			} catch (error: unknown) {
				// Let outer try/catch handle handled/printable errors
				if (error instanceof HandledError) {
					throw error;
				}

				if (error instanceof PrintableError) {
					throw error;
				}

				// Handle unknown errors
				throw new PrintableError(
					`${String(error)}\n\nEncountered this error while running the command at: ${chalk.bold(truncatedPath)}`
				);
			}
		}

		// Add spacing after
		for (let i = 0; i < config.spacing.after; i += 1) {
			console.log();
		}
	} catch (error: unknown) {
		if (error instanceof HandledError || error instanceof PrintableError) {
			// Print the error, if needed
			if (error instanceof PrintableError) {
				printPrettyError(error.message);
			}

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
