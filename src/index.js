// Dependencies
require('colors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const defaultSettings = require('./default-settings.js');
const ErrorWithoutStack = require('./error-without-stack.js');
const screens = require('./screens.js');
const utils = require('./utils.js');


// Handle exceptions
process.on('uncaughtException', (error) => {
	console.error(`${' ERROR '.inverse.red.bold}\n`);
	console.error((`> ${error.stack.replace(/^COMMAND ERROR: /, '').split('\n').join('\n> ')}\n`).red);
	
	process.exit(error.stack.match(/COMMAND ERROR: /) ? 255 : 1);
});


// The constructor, for use at the entry point
module.exports = function Constructor(customSettings) {
	// Merge custom settings into default settings
	const settings = Object.assign({}, defaultSettings);
	Object.assign(settings, customSettings);
	
	
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
	
	
	// Construct the input object
	const inputObject = utils(settings).constructInputObject(organizedArguments);
	
	
	// Handle --version
	if (inputObject.version) {
		// Output
		process.stdout.write(screens(settings).version());
		
		
		// Verbose output
		utils(settings).verboseLog('Skipping further processing...');
		
		
		// Stop processing
		return;
	}
	
	
	// Handle --help
	if (inputObject.help) {
		// Output
		process.stdout.write(screens(settings).help());
		
		
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
	
	
	// Verbose output
	utils(settings).verboseLog(`Constructed input: ${JSON.stringify(inputObject)}`);
	
	
	// Call onStart() function, if any
	if (typeof settings.onStart === 'function') {
		settings.onStart(inputObject);
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
			// Handle a SIGKILL
			if (code === null) {
				console.log(); // Ensure it goes to the next line
				process.exit();
			}
			
			
			// Handle if error message already happened
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


// A helper function provided to commands to keep error messages consistent
module.exports.error = function error(message) {
	throw new ErrorWithoutStack(`COMMAND ERROR: ${message}`);
};
