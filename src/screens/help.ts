// Imports
import chalk from '../utils/chalk.js';
import getAllProgramCommands from '../utils/get-all-program-commands.js';
import getConfig from '../utils/get-config.js';
import getMergedSpec from '../utils/get-merged-spec.js';
import getOrganizedArguments from '../utils/get-organized-arguments.js';
import verboseLog from '../utils/verbose-log.js';
import Table from 'cli-table3';

/** Return the content of the help screen */
export default async function helpScreen(): Promise<string> {
	// Get the config
	const config = await getConfig();

	// Initialize
	let outputString = '';

	// Organize the arguments
	const organizedArguments = await getOrganizedArguments();

	// Get all commands in this program
	let commands = await getAllProgramCommands();

	// Verbose output
	await verboseLog(`Found commands: ${commands.join(' | ')}`);

	// Add leading space to commands
	commands = commands.map((command) => ` ${command}`);
	const preppedCommand = ` ${organizedArguments.command}`.replace(/^ $/g, '');

	// Filter out any unnecessary commands, which are...
	commands = commands.filter((command) => command.startsWith(preppedCommand)); // Not related to current command
	commands = commands.filter(
		(command) => (command.match(/ /g) || []).length === (preppedCommand.match(/ /g) || []).length + 1
	); // Not a direct sub-command of the current command

	// Strip current command off front
	commands = commands.map((command) => command.substring(preppedCommand.length + 1));

	// Sort commands
	commands.sort();

	// Verbose output
	await verboseLog(`Processable: ${commands.join(' | ')}`);

	// Get merged spec for this command
	const mergedSpec = await getMergedSpec(organizedArguments.command);

	// Determine if certain features are available
	const hasFlags = Boolean(Object.entries(mergedSpec.flags ?? {}).length);
	const hasOptions = Boolean(Object.entries(mergedSpec.options ?? {}).length);
	const allowsData = typeof mergedSpec.data === 'object';
	const hasCommands = Boolean(commands.length);
	const allowsPassThrough = mergedSpec.acceptsPassThroughArgs;

	// Output description
	if (mergedSpec.description) {
		outputString += `${chalk.bold('Description:')} ${mergedSpec.description}\n`;
	}

	// Form and output usage line
	let usageLine = `${chalk.bold('Usage:')} ${config.usageCommand}${
		organizedArguments.command ? ` ${organizedArguments.command}` : ''
	}`;
	usageLine += chalk.gray(hasCommands ? ' [commands]' : '');
	usageLine += chalk.gray(hasFlags ? ' [flags]' : '');
	usageLine += chalk.gray(hasOptions ? ' [options]' : '');
	usageLine += chalk.gray(allowsData ? ' [data]' : '');
	usageLine += chalk.gray(allowsPassThrough ? ' -- [pass-through arguments]' : '');

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
		Object.entries(mergedSpec.flags ?? {}).forEach(([flag, details]) => {
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
		for (const [option, details] of Object.entries(mergedSpec.options ?? {})) {
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
				const arrayOrPromise = typeof details.accepts === 'function' ? details.accepts() : details.accepts;
				const accepts = arrayOrPromise instanceof Promise ? await arrayOrPromise : arrayOrPromise;

				if (!(accepts instanceof Array)) {
					throw new Error(`Error: option['${option}'].accepts must resolve to an array`);
				}

				fullDescription += chalk.gray.italic(` (accepts: ${accepts.join(', ')})`);
			}

			// Add to table
			table.push([`  --${option}${details.shorthand ? `, -${details.shorthand}` : ''}`, fullDescription]);
		}
	}

	// Add line for commands
	if (hasCommands) {
		// Add header
		table.push(['\nCOMMANDS:']);
	}

	// Loop over and push each command
	for (const command of commands) {
		const mergedSpec = await getMergedSpec(`${organizedArguments.command} ${command}`.trim());
		table.push([`  ${command}`, mergedSpec.description ? mergedSpec.description : '']);
	}

	// Print table
	outputString += `${table.toString()}\n`;

	// Handle data
	if (allowsData && typeof mergedSpec.data === 'object') {
		// Print header
		outputString += '\nDATA:\n';

		// Form full description
		let fullDescription = '';

		if (mergedSpec.data.description) {
			fullDescription += mergedSpec.data.description;
		} else {
			fullDescription += 'This command allows data to be passed in';
		}

		if (mergedSpec.data.required) {
			fullDescription += chalk.gray.italic(' (required)');
		}

		if (mergedSpec.data.type) {
			fullDescription += chalk.gray.italic(` (${mergedSpec.data.type})`);
		}

		if (mergedSpec.data.accepts && typeof mergedSpec.data.accepts !== 'function') {
			fullDescription += chalk.gray.italic(` (accepts: ${mergedSpec.data.accepts.join(', ')})`);
		}

		// Print
		outputString += `  ${fullDescription}\n`;
	}

	// Handle pass-through
	if (allowsPassThrough) {
		// Print header
		outputString += '\nPASS-THROUGH:\n';

		// Full description
		outputString += '  Arguments after ‘--’ will be passed through to an underlying command\n';
	}

	// Return
	return outputString.trim();
}
