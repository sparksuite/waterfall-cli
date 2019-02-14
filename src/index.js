// Dependencies
require('colors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const defaultSettings = require('./default-settings.js');
const utils = require('./utils.js');


// Handle exceptions
process.on('uncaughtException', (error) => {
	console.error();
	console.error(`${' ERROR '.inverse.red.bold}\n`);
	console.error((`> ${error.message.split('\n').join('\n> ')}\n`).red);

	process.exit(1);
});


// The main class
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
	const categorizedArguments = utils(settings).organizeArguments();
	
	
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
		// Get commands one level deep
		let commands = utils(settings).files.getAllDirectories(path.dirname(settings.mainFilename));
		commands = commands.map(file => file.replace(`${path.dirname(settings.mainFilename)}/`, ''));
		commands = commands.map(file => file.replace(/\.js$/, ''));
		commands = commands.map(file => file.replace(/\//g, '. '));
		
		
		// Verbose output
		utils(settings).verboseLog(`Found commands: ${commands.join(' | ')}`);
		
		
		// Process commands further
		commands = commands.map(file => `. ${file}`);
		commands.sort();
		commands.unshift('.');
		
		
		// Filter out any unnecessary commands
		commands = commands.filter(command => command.match(new RegExp(`^${categorizedArguments.command}`)));
		const commandLevel = (categorizedArguments.command.match(/ /g) || []).length;
		commands = commands.filter(command => (command.match(/ /g) || []).length <= (commandLevel + 1));
		
		
		// Verbose output
		utils(settings).verboseLog(`Processable: ${commands.join(' | ')}`);
		
		
		// Extra spacing
		console.log('');
		
		
		// Loop over each command
		commands.forEach((command, index) => {
			// Get merged spec for this command
			const mergedSpec = utils(settings).getMergedSpecForCommand(command);
			
			
			// Handle entry point
			if (index === 0) {
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
				
				
				// Determine if there are commands
				let hasCommands = false;
				
				if (index < (commands.length - 1)) {
					hasCommands = true;
				}
				
				
				// Output usage line
				console.log(`${'Usage:'.bold} node ${path.basename(settings.mainFilename)}${command}${(hasCommands ? ' [commands]' : '').gray}${(hasFlags ? ' [flags]' : '').gray}${(hasOptions ? ' [options]' : '').gray}`);
				
				
				// Handle flags
				if (hasFlags) {
					// Header
					console.log('\nFLAGS:');
					
					
					// List flags
					Object.entries(mergedSpec.flags).forEach(([flag, details]) => {
						console.log(`  --${flag}${details.shorthand ? `, -${details.shorthand}` : ''}${details.description ? `    ${details.description}` : ''}`);
					});
				}
				
				
				// Handle options
				if (hasOptions) {
					// Header
					console.log('\nOPTIONS:');
					
					
					// List options
					Object.entries(mergedSpec.options).forEach(([option, details]) => {
						console.log(`  --${option}${details.shorthand ? `, -${details.shorthand}` : ''}${details.description ? `    ${details.description}` : ''}`);
					});
				}
				
				
				// Add line for commands
				if (hasCommands) {
					// Header
					console.log('\nCOMMANDS:');
				}
			} else {
				// List the command
				console.log(`  ${command.replace(new RegExp(`^${categorizedArguments.command}`), '')}${mergedSpec.description ? `    ${mergedSpec.description}` : ''}`);
			}
		});
		
		
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
	const commandPieces = categorizedArguments.command.trim().split(' ');
	
	commandPieces.forEach((command, index) => {
		// Update current path prefix
		currentPathPrefix = path.join(currentPathPrefix, command);
		
		
		// Get the files we care about
		const commandFiles = utils(settings).files.getFiles(currentPathPrefix);
		
		
		// Get the command path
		const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
		
		
		// Get spec
		const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
		const spec = JSON.parse(fs.readFileSync(specFilePath));
		
		
		// Push onto array, if needed
		if (index === (commandPieces.length - 1) || spec.executeOnCascade === true) {
			executionPaths.push(commandPath);
		}
	});
	
	
	// Execute each path sequentially, starting with the first
	const executePath = (paths) => {
		// Stop if none
		if (paths.length === 0) {
			return;
		}
		
		
		// Verbose output
		utils(settings).verboseLog(`Executing: ${paths[0]}\n`);
		
		
		// Spawn child
		const child = spawn('node', [paths[0]]);
		
		
		// Wait for exit
		child.on('exit', (code) => {
			// Handle an issue
			if (code !== 0) {
				utils(settings).printFatalError(`Received exit code ${code} from: ${paths[0]}\nSee above output`);
			}
			
			
			// Run next path, if one exists
			if (paths[1]) {
				executePath(paths.slice(1));
			}
		});
		
		
		// Handle error
		child.on('error', (error) => {
			utils(settings).printFatalError(error.toString().replace(/^Error: /i, ''));
		});
		
		
		// Handle stdio
		child.stdout.on('data', (data) => {
			process.stdout.write(data.toString());
		});
		
		child.stderr.on('data', (data) => {
			process.stderr.write(data.toString().red);
		});
	};
	
	executePath(executionPaths);
};
