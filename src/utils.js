// Dependencies
const fs = require('fs');
const path = require('path');


// Helpful utility functions
module.exports = function Constructor(currentSettings) {
	// Store an internal copy of the current settings
	const settings = Object.assign({}, currentSettings);
	
	
	// Return the functions
	return {
		// Verbose log output helper function
		verboseLog(message) {
			if (settings.verbose) {
				console.log((`[VERBOSE] ${message}`).dim.italic);
			}
		},
		
		
		// Process arguments
		processArguments(argv) {
			const processedArguments = [];
			
			argv.forEach((argument) => {
				if (argument.substr(0, 2) === '--') {
					argument.split('=').forEach((piece) => {
						processedArguments.push(piece);
					});
				} else {
					processedArguments.push(argument);
				}
			});
			
			return processedArguments.slice(2);
		},
		
		
		// Retrieve app information
		retrieveAppInformation() {
			// Initialize
			const app = Object.assign({}, settings.app);
			
			
			// Build path to package.json file
			const pathToPackageFile = `${path.dirname(settings.mainFilename)}/${settings.packageFilePath}`;
			
			
			// Handle if a package.json file exists
			if (fs.existsSync(pathToPackageFile)) {
				// Verbose output
				module.exports(settings).verboseLog(`Found package.json at: ${pathToPackageFile}`);
				
				
				// Get package
				const packageInfo = JSON.parse(fs.readFileSync(pathToPackageFile));
				
				
				// Store information
				app.name = app.name || packageInfo.name;
				app.version = app.version || packageInfo.version;
			} else {
				module.exports(settings).verboseLog(`Could not find package.json at: ${pathToPackageFile}`);
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
			let currentPathPrefix = path.dirname(settings.mainFilename);
			
			pieces.forEach((piece, index) => {
				// Append to path prefix
				if (piece) {
					currentPathPrefix += `/${piece}`;
				}
				
				
				// Get the files we care about
				const commandFiles = module.exports(settings).files.getFiles(currentPathPrefix);
				
				
				// Error if not exactly one .js and one .json file
				if (commandFiles.filter(path => path.match(/\.js$/)).length !== 1) {
					throw new Error(`There should be exactly one .js file in: ${currentPathPrefix}`);
				}
				
				if (commandFiles.filter(path => path.match(/\.json$/)).length !== 1) {
					throw new Error(`There should be exactly one .json file in: ${currentPathPrefix}`);
				}
				
				
				// Get spec
				const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
				const spec = JSON.parse(fs.readFileSync(specFilePath));
				
				
				// Build onto spec
				if (typeof spec.flags === 'object') {
					Object.entries(spec.flags).forEach(([flag, details]) => {
						if (index === (pieces.length - 1) || details.cascades === true) {
							mergedSpec.flags[flag] = details;
						}
					});
				}
				
				if (typeof spec.options === 'object') {
					Object.entries(spec.options).forEach(([option, details]) => {
						if (index === (pieces.length - 1) || details.cascades === true) {
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
				data: '',
				command: '',
			};
			
			let previousOption = null;
			let nextIsOptionValue = false;
			let chainBroken = false;
			
			
			// Loop over every command
			let currentPathPrefix = path.dirname(settings.mainFilename);
			
			settings.arguments.forEach((argument) => {
				// Verbose output
				module.exports(settings).verboseLog(`Inspecting argument: ${argument}`);
				
				
				// Skip option values
				if (nextIsOptionValue) {
					// Verbose output
					module.exports(settings).verboseLog(`...Is value for previous option (${previousOption})`);
					
					
					// Store and continue
					nextIsOptionValue = false;
					organized.values.push(argument);
					return;
				}
				
				
				// Skip options/flags
				if (argument[0] === '-') {
					// Get merged spec for this command
					const mergedSpec = module.exports(settings).getMergedSpecForCommand(organized.command);
					
					
					// Check if this is an option
					if (typeof mergedSpec.options === 'object') {
						Object.entries(mergedSpec.options).forEach(([option, details]) => {
							if (argument === `--${option.trim().toLowerCase()}`) {
								// Verbose output
								module.exports(settings).verboseLog('...Is an option');
								
								
								// Store details
								previousOption = `--${option.trim().toLowerCase()}`;
								nextIsOptionValue = true;
								organized.options.push(option);
							} else if (details.shorthand && argument === `-${details.shorthand.trim().toLowerCase()}`) {
								// Verbose output
								module.exports(settings).verboseLog('...Is an option');
								
								
								// Store details
								previousOption = `-${details.shorthand.trim().toLowerCase()}`;
								nextIsOptionValue = true;
								organized.options.push(option);
							}
						});
					}
					
					
					// Handle flags
					if (nextIsOptionValue === false) {
						// Push flag
						organized.flags.push(argument);
						
						
						// Verbose output
						module.exports(settings).verboseLog('...Is a flag');
					}
					
					
					// Skip further processing
					return;
				}
				
				
				// Get the files we care about
				const commandFiles = module.exports(settings).files.getFiles(`${currentPathPrefix}/${argument}`);
				
				
				// Get the command path
				const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
				
				
				// Check if that file exists
				if (!chainBroken && fs.existsSync(commandPath)) {
					// Verbose output
					module.exports(settings).verboseLog('...Is a command');
					
					
					// Add to currents
					currentPathPrefix += `/${argument}`;
					organized.command += ` ${argument}`;
				} else {
					// Verbose output
					module.exports(settings).verboseLog('...Is a data value');
					
					
					// Store details
					chainBroken = true;
					organized.data += ` ${argument}`;
				}
			});
			
			
			// Clean up components
			organized.command = organized.command.trim();
			organized.data = organized.data.trim();
			
			if (organized.data === '') {
				organized.data = null;
			}
			
			
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
				
				return allItems.filter(module.exports(settings).files.isFile);
			},
			
			
			// Get child directories of a parent directory
			getDirectories(directory) {
				if (!fs.existsSync(directory)) {
					return [];
				}
				
				const allItems = fs.readdirSync(directory).map(name => path.join(directory, name));
				
				return allItems.filter(module.exports(settings).files.isDirectory);
			},
			
			
			// Get child directories of a parent directory, recursively & synchronously
			getAllDirectories(directory) {
				if (!fs.existsSync(directory)) {
					return [];
				}
				
				return fs.readdirSync(directory).reduce((files, file) => {
					const name = path.join(directory, file);
					
					if (module.exports(settings).files.isDirectory(name)) {
						return [...files, name, ...module.exports(settings).files.getAllDirectories(name)];
					}
					
					return [...files];
				}, []);
			},
		},
	};
};
