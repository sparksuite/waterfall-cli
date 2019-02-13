// Dependencies
const { spawn } = require('child_process');
require('colors');
const fs = require('fs');
const path = require('path');


// The default options
const options = {
	app: {
		name: null,
		version: null,
	},
	arguments: process.argv.join(' ').split(/[\s=]+/).slice(2),
	packageFilePath: '../package.json',
	verbose: false,
};


// The main class
exports = function Constructor(customOptions) {
	// Merge options into default options
	Object.assign(options, customOptions);
	
	
	// Determine app information
	options.app = exports.utils.retrieveAppInformation(require.main.filename);
	
	
	// Verbose output
	exports.utils.verboseLog(`Set app name to: ${options.app.name}`);
	exports.utils.verboseLog(`Set app version to: ${options.app.version}`);
	
	
	// Organize the arguments
	const categorizedArguments = exports.utils.organizeArguments();
	
	
	// Handle --version
	if (options.arguments.includes('-v') || options.arguments.includes('--version')) {
		// Extra spacing
		console.log('');
		
		
		// Print name, if we have one
		if (options.app.name) {
			process.stdout.write((`${options.app.name}: `).bold);
		}
		
		
		// Print version
		console.log(`${options.app.version}\n`);
		
		
		// Verbose output
		exports.utils.verboseLog('Skipping further processing...');
		
		
		// Stop processing
		return;
	}
	
	
	// Handle --help
	if (options.arguments.length === 0 || options.arguments.includes('-h') || options.arguments.includes('--help')) {
		// Get commands one level deep
		let commands = exports.utils.files.getAllDirectories(path.dirname(require.main.filename));
		commands = commands.map(file => file.replace(`${path.dirname(require.main.filename)}/`, ''));
		commands = commands.map(file => file.replace(/\.js$/, ''));
		commands = commands.map(file => file.replace(/\//g, ' '));
		
		
		// Verbose output
		exports.utils.verboseLog(`Found commands: ${commands.join(' | ')}`);
		
		
		// Process commands further
		commands = commands.map(file => ` ${file}`);
		commands.sort();
		commands.unshift('');
		
		
		// Filter out any unnecessary commands
		commands = commands.filter(command => command.match(new RegExp(`^${categorizedArguments.command}`)));
		const commandLevel = (categorizedArguments.command.match(/ /g) || []).length;
		commands = commands.filter(command => (command.match(/ /g) || []).length <= (commandLevel + 1));
		
		
		// Verbose output
		exports.utils.verboseLog(`Processable: ${commands.join(' | ')}`);
		
		
		// Extra spacing
		console.log('');
		
		
		// Loop over each command
		commands.forEach((command, index) => {
			// Get merged spec for this command
			const mergedSpec = exports.utils.getMergedSpecForCommand(command);
			
			
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
				console.log(`${'Usage:'.bold} node ${path.basename(require.main.filename)}${command}${(hasCommands ? ' [commands]' : '').gray}${(hasFlags ? ' [flags]' : '').gray}${(hasOptions ? ' [options]' : '').gray}`);
				
				
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
		exports.utils.verboseLog('Skipping further processing...');
		
		
		// Stop processing
		return;
	}
	
	
	// Form execution paths
	const executionPaths = [];
	let currentPathPrefix = path.dirname(require.main.filename);
	const commandPieces = categorizedArguments.command.trim().split(' ');
	
	commandPieces.forEach((command, index) => {
		// Update current path prefix
		currentPathPrefix = path.join(currentPathPrefix, command);
		
		
		// Get the files we care about
		const commandFiles = exports.utils.files.getFiles(currentPathPrefix);
		
		
		// Get the command path
		const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
		
		
		// Get spec
		const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
		const spec = JSON.parse(fs.readFileSync(specFilePath));
		
		
		// Push onto array, if needed
		if (index === (commandPieces.length - 1) || spec.executeOnPassthrough === true) {
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
		exports.utils.verboseLog(`Executing: ${paths[0]}\n`);
		
		
		// Spawn child
		const child = spawn('node', [paths[0]]);
		
		
		// Wait for exit
		child.on('exit', (code) => {
			// Handle an issue
			if (code !== 0) {
				exports.utils.printFatalError(`Received exit code ${code} from: ${paths[0]}\nSee above output`);
			}
			
			
			// Run next path, if one exists
			if (paths[1]) {
				executePath(paths.slice(1));
			}
		});
		
		
		// Handle error
		child.on('error', (error) => {
			exports.utils.printFatalError(error.toString().replace(/^Error: /i, ''));
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


// Utils functions
exports.utils = {
	// Enable test mode
	enableTestMode() {
		options.verbose = true;
	},
	
	
	// Verbose log output helper function
	verboseLog(message) {
		if (options.verbose) {
			console.log((`[VERBOSE] ${message}`).dim.italic);
		}
	},
	
	
	// Error message helper function
	printFatalError(message) {
		console.error();
		console.error(`${' ERROR '.inverse.red.bold}\n`);
		console.error((`> ${message.split('\n').join('\n> ')}\n`).red);
		process.exit(1);
	},
	
	
	// Retrieve app information
	retrieveAppInformation(mainFilename) {
		// Initialize
		const { app } = options;
		
		
		// Build path to package.json file
		const pathToPackageFile = `${path.dirname(mainFilename)}/${options.packageFilePath}`;
		
		
		// Handle if a package.json file exists
		if (fs.existsSync(pathToPackageFile)) {
			// Verbose output
			exports.utils.verboseLog(`Found package.json at: ${pathToPackageFile}`);
			
			
			// Get package
			const packageInfo = JSON.parse(fs.readFileSync(pathToPackageFile));
			
			
			// Store information
			app.name = app.name || packageInfo.name;
			app.version = app.version || packageInfo.version;
		} else {
			exports.utils.verboseLog(`Could not find package.json at: ${pathToPackageFile}`);
		}
		
		
		// Return info
		return app;
	},
	
	
	// Get specs for a command
	getMergedSpecForCommand(command) {
		// Break into pieces, with entry point
		const pieces = command.split(' ');
		
		
		// Initialize
		const mergedSpec = {
			description: null,
			data: {},
			flags: {},
			options: {},
		};
		
		
		// Loop over every piece
		let currentPathPrefix = path.dirname(require.main.filename);
		
		pieces.forEach((piece, index) => {
			// Append to path prefix
			if (piece) {
				currentPathPrefix += `/${piece}`;
			}
			
			
			// Get the files we care about
			const commandFiles = exports.utils.files.getFiles(currentPathPrefix);
			
			
			// Error if not exactly one .js and one .json file
			if (commandFiles.filter(path => path.match(/\.js$/)).length !== 1) {
				exports.utils.printFatalError(`There should be exactly one .js file in: ${currentPathPrefix}`);
			}
			
			if (commandFiles.filter(path => path.match(/\.json$/)).length !== 1) {
				exports.utils.printFatalError(`There should be exactly one .json file in: ${currentPathPrefix}`);
			}
			
			
			// Get spec
			const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
			const spec = JSON.parse(fs.readFileSync(specFilePath));
			
			
			// Build onto spec
			if (typeof spec.flags === 'object') {
				Object.entries(spec.flags).forEach(([flag, details]) => {
					if (index === (pieces.length - 1) || details.carriesDown === true) {
						mergedSpec.flags[flag] = details;
					}
				});
			}
			
			if (typeof spec.options === 'object') {
				Object.entries(spec.options).forEach(([option, details]) => {
					if (index === (pieces.length - 1) || details.carriesDown === true) {
						mergedSpec.options[option] = details;
					}
				});
			}
			
			if (index === (pieces.length - 1)) {
				mergedSpec.description = spec.description;
				mergedSpec.data = spec.data;
			}
		});
		
		
		// Return spec
		return mergedSpec;
	},
	
	
	// Organize arguments into categories
	organizeArguments() {
		// Initialize
		const organized = {
			flags: [],
			options: [],
			values: [],
			data: [],
			command: '',
		};
		
		let previousOption = null;
		let nextIsOptionValue = false;
		let chainBroken = false;
		
		
		// Loop over every command
		let currentPathPrefix = path.dirname(require.main.filename);
		
		options.arguments.forEach((argument) => {
			// Verbose output
			exports.utils.verboseLog(`Inspecting argument: ${argument}`);
			
			
			// Skip option values
			if (nextIsOptionValue) {
				// Verbose output
				exports.utils.verboseLog(`...Is value for previous option (${previousOption})`);
				
				
				// Store and continue
				nextIsOptionValue = false;
				organized.values.push(argument);
				return;
			}
			
			
			// Skip options/flags
			if (argument[0] === '-') {
				// Get merged spec for this command
				const mergedSpec = exports.utils.getMergedSpecForCommand(organized.command);
				
				
				// Check if this is an option
				if (typeof mergedSpec.options === 'object') {
					Object.entries(mergedSpec.options).forEach(([option, details]) => {
						if (argument === `--${option.trim().toLowerCase()}`) {
							// Verbose output
							exports.utils.verboseLog('...Is an option');
							
							
							// Store details
							previousOption = `--${option.trim().toLowerCase()}`;
							nextIsOptionValue = true;
							organized.options.push(argument);
						} else if (details.shorthand && argument === `-${details.shorthand.trim().toLowerCase()}`) {
							// Verbose output
							exports.utils.verboseLog('...Is an option');
							
							
							// Store details
							previousOption = `-${details.shorthand.trim().toLowerCase()}`;
							nextIsOptionValue = true;
							organized.options.push(argument);
						}
					});
				}
				
				
				// Handle flags
				if (nextIsOptionValue === false) {
					// Push flag
					organized.flags.push(argument);
					
					
					// Verbose output
					exports.utils.verboseLog('...Is a flag');
				}
				
				
				// Skip further processing
				return;
			}
			
			
			// Get the files we care about
			const commandFiles = exports.utils.files.getFiles(`${currentPathPrefix}/${argument}`);
			
			
			// Get the command path
			const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
			
			
			// Check if that file exists
			if (!chainBroken && fs.existsSync(commandPath)) {
				// Verbose output
				exports.utils.verboseLog('...Is a command');
				
				
				// Add to currents
				currentPathPrefix += `/${argument}`;
				organized.command += ` ${argument}`;
			} else {
				// Verbose output
				exports.utils.verboseLog('...Is a data value');
				
				
				// Store details
				chainBroken = true;
				organized.data.push(argument);
			}
		});
		
		
		// Return
		return organized;
	},
	
	
	// File functions
	files: {
		// Return true if this path is a directory
		isDirectory(path) {
			return fs.lstatSync(path).isDirectory();
		},
		
		
		// Return true if this path is a file
		isFile(path) {
			return fs.lstatSync(path).isFile();
		},
		
		
		// Get child files of a parent directory
		getFiles(directory) {
			if (!fs.existsSync(directory)) {
				return [];
			}
			
			const allItems = fs.readdirSync(directory).map(name => path.join(directory, name));
			
			return allItems.filter(exports.utils.files.isFile);
		},
		
		
		// Get child directories of a parent directory
		getDirectories(directory) {
			if (!fs.existsSync(directory)) {
				return [];
			}
			
			const allItems = fs.readdirSync(directory).map(name => path.join(directory, name));
			
			return allItems.filter(exports.utils.files.isDirectory);
		},
		
		
		// Get child directories of a parent directory, recursively & synchronously
		getAllDirectories(directory) {
			if (!fs.existsSync(directory)) {
				return [];
			}
			
			return fs.readdirSync(directory).reduce((files, file) => {
				const name = path.join(directory, file);
				
				if (exports.utils.files.isDirectory(name)) {
					return [...files, name, ...exports.utils.files.getAllDirectories(name)];
				}
				
				return [...files];
			}, []);
		},
	},
};
