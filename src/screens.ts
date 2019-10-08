// Dependencies
import chalk from 'chalk';
import Table from 'cli-table';
import utils, { OrganizedArguments, Settings, CommandSpec } from './utils';

// Default export
function screens(currentSettings: Settings) {
	// Store an internal copy of the current settings
	const settings: Settings = { ...currentSettings };

	// Return the functions
	return {
		// Return the content of the version info screen
		version() {
			// Initialize
			let outputString = '';

			// Add name, if we have one
			if (settings.app.name) {
				outputString += chalk.bold(`${settings.app.name}: `);
			}

			// Add version and a newline
			outputString += `${settings.app.version}\n`;

			// Add spacing after
			for (let i = 0; i < settings.spacing.after; i += 1) {
				outputString += '\n';
			}

			// Return
			return outputString;
		},

		// Return the content of the help screen
		help() {
			// Initialize
			let outputString = '';

			// Organize the arguments
			const organizedArguments: OrganizedArguments = utils(
				settings
			).organizeArguments();

			// Get all commands in this program
			let commands: string[] = utils(settings).getAllProgramCommands();

			// Verbose output
			utils(settings).verboseLog(`Found commands: ${commands.join(' | ')}`);

			// Add leading space to commands
			commands = commands.map(command => ` ${command}`);
			const preppedCommand = ` ${organizedArguments.command}`.replace(
				/^ $/g,
				''
			);

			// Filter out any unnecessary commands, which are...
			commands = commands.filter(command => command.startsWith(preppedCommand)); // Not related to current command
			commands = commands.filter(
				command =>
					(command.match(/ /g) || []).length ===
					(preppedCommand.match(/ /g) || []).length + 1
			); // Not a direct sub-command of the current command

			// Strip current command off front
			commands = commands.map(command =>
				command.substring(preppedCommand.length + 1)
			);

			// Sort commands
			commands.sort();

			// Verbose output
			utils(settings).verboseLog(`Processable: ${commands.join(' | ')}`);

			// Get merged spec for this command
			const mergedSpec: CommandSpec = utils(settings).getMergedSpec(
				organizedArguments.command
			);

			// Determine if there are flags
			let hasFlags = false;

			if (Object.entries(mergedSpec.flags).length) {
				hasFlags = true;
			}

			// Determine if there are options
			let hasOptions = false;

			if (Object.entries(mergedSpec.options).length) {
				hasOptions = true;
			}

			// Determine if it accepts data
			let acceptsData = false;

			if (mergedSpec.data && mergedSpec.data.description) {
				acceptsData = true;
			}

			// Determine if there are commands
			let hasCommands = false;

			if (commands.length) {
				hasCommands = true;
			}

			// Output description
			if (mergedSpec.description) {
				outputString += `${chalk.bold('Description:')} ${
					mergedSpec.description
				}\n`;
			}

			// Form and output usage line
			let usageLine = `${chalk.bold('Usage:')} ${settings.usageCommand}${
				organizedArguments.command ? ` ${organizedArguments.command}` : ''
			}`;
			usageLine += chalk.gray(hasCommands ? ' [commands]' : '');
			usageLine += chalk.gray(hasFlags ? ' [flags]' : '');
			usageLine += chalk.gray(hasOptions ? ' [options]' : '');
			usageLine += chalk.gray(acceptsData ? ' [data]' : '');

			outputString += `${usageLine}\n`;

			// Initialize table
			const table = new Table({
				chars: {
					top: '',
					'top-mid': '',
					'top-left': '',
					'top-right': '',
					bottom: '',
					'bottom-mid': '',
					'bottom-left': '',
					'bottom-right': '',
					left: '',
					'left-mid': '',
					mid: '',
					'mid-mid': '',
					right: '',
					'right-mid': '',
					middle: '    ',
				},
				style: {
					'padding-left': 0,
					'padding-right': 0,
				},
			});

			// Handle flags
			if (hasFlags) {
				// Add header
				table.push(['\nFLAGS:']);

				// List flags
				Object.entries(mergedSpec.flags).forEach(([flag, details]) => {
					table.push([
						`  --${flag}${details.shorthand ? `, -${details.shorthand}` : ''}`,
						`${details.description ? `${details.description}` : ''}`,
					]);
				});
			}

			// Handle options
			if (hasOptions) {
				// Add header
				table.push(['\nOPTIONS:']);

				// List options
				Object.entries(mergedSpec.options).forEach(([option, details]) => {
					// Form full description
					let fullDescription = '';

					if (details.description) {
						fullDescription += details.description;
					}

					if (details.required) {
						fullDescription += chalk.gray.italic(' (required)');
					}

					if (details.type) {
						fullDescription += chalk.gray.italic(` (${details.type})`);
					}

					if (details.accepts) {
						fullDescription += chalk.gray.italic(
							` (accepts: ${details.accepts.join(', ')})`
						);
					}

					// Add to table
					table.push([
						`  --${option}${
							details.shorthand ? `, -${details.shorthand}` : ''
						}`,
						fullDescription,
					]);
				});
			}

			// Add line for commands
			if (hasCommands) {
				// Add header
				table.push(['\nCOMMANDS:']);
			}

			// Loop over and push each command
			commands.forEach(command => {
				const mergedSpec = utils(settings).getMergedSpec(
					`${organizedArguments.command} ${command}`.trim()
				);
				table.push([
					`  ${command}`,
					mergedSpec.description ? mergedSpec.description : '',
				]);
			});

			// Print table
			outputString += `${table.toString()}\n`;

			// Handle data
			if (acceptsData) {
				// Print header
				outputString += '\nDATA:\n';

				// Form full description
				let fullDescription = '';

				if (mergedSpec.data.description) {
					fullDescription += mergedSpec.data.description;
				}

				if (mergedSpec.data.required) {
					fullDescription += chalk.gray.italic(' (required)');
				}

				if (mergedSpec.data.type) {
					fullDescription += chalk.gray.italic(` (${mergedSpec.data.type})`);
				}

				if (mergedSpec.data.accepts) {
					fullDescription += chalk.gray.italic(
						` (accepts: ${mergedSpec.data.accepts.join(', ')})`
					);
				}

				// Print
				outputString += `  ${fullDescription}\n`;
			}

			// Add spacing after
			for (let i = 0; i < settings.spacing.after; i += 1) {
				outputString += '\n';
			}

			// Return
			return outputString;
		},
	};
}

export default screens;
