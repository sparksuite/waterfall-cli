// Dependencies
require('colors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Table = require('cli-table');
const defaultSettings = require('./default-settings.js');
const ErrorWithoutStack = require('./error-without-stack.js');
const utils = require('./utils.js');


// Handle exceptions
process.on('uncaughtException', (error) => {
	console.error();
	console.error(`${' ERROR '.inverse.red.bold}\n`);
	console.error((`> ${error.stack.split('\n').join('\n> ')}\n`).red);
	
	process.exit(1);
});


// The constructor, for use at the entry point
module.exports = function Constructor(customSettings) {
	// Merge custom settings into default settings
	const settings = Object.assign({}, defaultSettings);
	Object.assign(settings, customSettings);
	
	
	// Determine app information
	settings.app = utils(settings).retrieveAppInformation();
	
	
	// Verbose output
	utils(settings).verboseLog(`Set app name to: ${settings.app.name}`);
	utils(settings).verboseLog(`Set app version to: ${settings.app.version}`);
	
	
	// Organize the arguments
	const organizedArguments = utils(settings).organizeArguments();
	
	
	// Handle --version
	if (settings.arguments.includes('-v') || settings.arguments.includes('--version')) {
		// Extra spacing
		console.log('');
		
		
		// Print name, if we have one
		if (settings.app.name) {
			process.stdout.write((`${settings.app.name}: `).bold);
		}
		
		
		// Print version
		console.log(`${settings.app.version}\n`);
		
		
		// Verbose output
		utils(settings).verboseLog('Skipping further processing...');
		
		
		// Stop processing
		return;
	}
	
	
	// Handle --help
	if (settings.arguments.length === 0 || settings.arguments.includes('-h') || settings.arguments.includes('--help')) {
		// Get all commands in program
		let commands = utils(settings).files.getAllDirectories(path.dirname(settings.mainFilename));
		commands = commands.map(file => file.replace(`${path.dirname(settings.mainFilename)}/`, ''));
		commands = commands.map(file => file.replace(/\.js$/, ''));
		commands = commands.map(file => file.replace(/\//, ' '));
		
		
		// Verbose output
		utils(settings).verboseLog(`Found commands: ${commands.join(' | ')}`);
		
		
		// Add leading space to commands
		commands = commands.map(command => ` ${command}`);
		const preppedCommand = ` ${organizedArguments.command}`.replace(/^ $/g, '');
		
		
		// Filter out any unnecessary commands, which are...
		commands = commands.filter(command => command.substring(0, preppedCommand.length) === `${preppedCommand}`); // Not related to current command
		commands = commands.filter(command => (command.match(/ /g) || []).length === ((preppedCommand.match(/ /g) || []).length + 1)); // Not a direct sub-command of the current command
		
		
		// Strip current command off front
		commands = commands.map(command => command.substring(preppedCommand.length + 1));
		
		
		// Sort commands
		commands.sort();
		
		
		// Verbose output
		utils(settings).verboseLog(`Processable: ${commands.join(' | ')}`);
		
		
		// Extra spacing
		console.log('');
		
		
		// Get merged spec for this command
		const mergedSpec = utils(settings).getMergedSpec(organizedArguments.command);
		
		
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
		
		
		// Form and output usage line
		let usageLine = `${'Usage:'.bold} ${settings.usageCommand}${(organizedArguments.command ? ` ${organizedArguments.command}` : '')}`;
		usageLine += `${(hasCommands ? ' [commands]' : '').gray}`;
		usageLine += `${(hasFlags ? ' [flags]' : '').gray}`;
		usageLine += `${(hasOptions ? ' [options]' : '').gray}`;
		usageLine += `${(acceptsData ? ' [data]' : '').gray}`;
		
		console.log(usageLine);
		
		
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
				table.push([`  --${flag}${details.shorthand ? `, -${details.shorthand}` : ''}`, `${details.description ? `${details.description}` : ''}`]);
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
					fullDescription += ' (required)'.gray.italic;
				}
				
				if (details.type) {
					fullDescription += ` (${details.type})`.gray.italic;
				}
				
				if (details.accepts) {
					fullDescription += ` (accepts: ${details.accepts.join(', ')})`.gray.italic;
				}
				
				
				// Add to table
				table.push([`  --${option}${details.shorthand ? `, -${details.shorthand}` : ''}`, fullDescription]);
			});
		}
		
		
		// Add line for commands
		if (hasCommands) {
			// Add header
			table.push(['\nCOMMANDS:']);
		}
		
		
		// Loop over and push each command
		commands.forEach((command) => {
			const mergedSpec = utils(settings).getMergedSpec(`${organizedArguments.command} ${command}`.trim());
			table.push([`  ${command}`, mergedSpec.description ? mergedSpec.description : '']);
		});
		
		
		// Print table
		console.log(table.toString());
		
		
		// Handle data
		if (acceptsData) {
			// Print header
			console.log('\nDATA:');
			
			
			// Form full description
			let fullDescription = '';
			
			if (mergedSpec.data.description) {
				fullDescription += mergedSpec.data.description;
			}
			
			if (mergedSpec.data.required) {
				fullDescription += ' (required)'.gray.italic;
			}
			
			if (mergedSpec.data.type) {
				fullDescription += ` (${mergedSpec.data.type})`.gray.italic;
			}
			
			if (mergedSpec.data.accepts) {
				fullDescription += ` (accepts: ${mergedSpec.data.accepts.join(', ')})`.gray.italic;
			}
			
			
			// Print
			console.log(`  ${fullDescription}`);
		}
		
		
		// Extra spacing
		console.log('');
		
		
		// Verbose output
		utils(settings).verboseLog('Skipping further processing...');
		
		
		// Stop processing
		return;
	}
	
	
	// Form execution paths
	const executionPaths = [];
	let currentPathPrefix = path.dirname(settings.mainFilename);
	const commandPieces = organizedArguments.command.trim().split(' ');
	
	commandPieces.forEach((command, index) => {
		// Update current path prefix
		currentPathPrefix = path.join(currentPathPrefix, command);
		
		
		// Get the files we care about
		const commandFiles = utils(settings).files.getFiles(currentPathPrefix);
		
		
		// Get the command path
		const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
		
		
		// Get spec
		const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
		let spec = {};
		
		try {
			spec = JSON.parse(fs.readFileSync(specFilePath));
		} catch (error) {
			throw new ErrorWithoutStack(`This file has bad JSON: ${specFilePath}`);
		}
		
		
		// Push onto array, if needed
		if (index === (commandPieces.length - 1) || spec.executeOnCascade === true) {
			executionPaths.push(commandPath);
		}
	});
	
	
	// Construct the input object
	const inputObject = utils(settings).constructInputObject(organizedArguments);
	
	
	// Verbose output
	utils(settings).verboseLog(`Constructed input: ${JSON.stringify(inputObject)}`);
	
	
	// Add spacing before
	for (let i = 0; i < settings.spacing.before; i += 1) {
		console.log();
	}
	
	
	// Execute each path sequentially, starting with the first
	const executePath = (paths) => {
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
		child.on('exit', (code) => {
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
		child.on('error', (error) => {
			throw new Error(error.toString().replace(/^Error: /i, ''));
		});
	};
	
	executePath(executionPaths);
};


// The function used to kick off commands
module.exports.command = function command() {
	return JSON.parse(process.argv[2]);
};
