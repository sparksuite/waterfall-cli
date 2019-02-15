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
				flags: {
					version: {
						shorthand: 'v',
						description: 'Show version',
					},
					help: {
						shorthand: 'h',
						description: 'Show help',
					},
				},
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
				data: null,
				command: '',
			};
			
			let previousOption = null;
			let nextIsOptionValue = false;
			let nextValueType = null;
			let nextValidValues = null;
			let chainBroken = false;
			
			
			// Loop over every command
			let currentPathPrefix = path.dirname(settings.mainFilename);
			
			settings.arguments.forEach((argument, index) => {
				// Verbose output
				module.exports(settings).verboseLog(`Inspecting argument: ${argument}`);
				
				
				// Skip option values
				if (nextIsOptionValue) {
					// Verbose output
					module.exports(settings).verboseLog(`...Is value for previous option (${previousOption})`);
					
					
					// Validate value, if necessary
					if (nextValidValues) {
						if (!nextValidValues.includes(argument)) {
							throw new Error(`Unrecognized value for ${previousOption}: ${argument}\nValid values: ${nextValidValues.join(', ')}`);
						}
					}
					
					if (nextValueType) {
						if (nextValueType === 'integer') {
							if (argument.match(/^[0-9]+$/) !== null) {
								argument = parseInt(argument);
							} else {
								throw new Error(`The option ${previousOption} expects an integer\nProvided: ${argument}`);
							}
						} else if (nextValueType === 'float') {
							if (argument.match(/^[0-9]*[\.]*[0-9]*$/) !== null && argument !== '.' && argument !== '') {
								argument = parseFloat(argument);
							} else {
								throw new Error(`The option ${previousOption} expects a float\nProvided: ${argument}`);
							}
						} else {
							throw new Error(`Unrecognized "type": ${nextValueType}`);
						}
					}
					
					
					// Store and continue
					nextIsOptionValue = false;
					organized.values.push(argument);
					return;
				}
				
				
				// Get merged spec for this command
				const mergedSpec = module.exports(settings).getMergedSpecForCommand(organized.command);
				
				
				// Skip options/flags
				if (argument[0] === '-') {
					// Check if this is an option
					if (typeof mergedSpec.options === 'object') {
						Object.entries(mergedSpec.options).forEach(([option, details]) => {
							// Check for a match
							const matchesFullOption = (argument === `--${option.trim().toLowerCase()}`);
							const matchesShorthandOption = (details.shorthand && argument === `-${details.shorthand.trim().toLowerCase()}`);
							
							
							// Handle a match
							if (matchesFullOption || matchesShorthandOption) {
								// Verbose output
								module.exports(settings).verboseLog('...Is an option');
								
								
								// Store details
								previousOption = argument;
								nextIsOptionValue = true;
								nextValidValues = details.values;
								nextValueType = details.type;
								organized.options.push(option);
							}
						});
					}
					
					
					// Handle flags
					if (nextIsOptionValue === false) {
						// Initialize
						let matchedFlag = false;
						
						
						// Check if this is a valid flag
						if (typeof mergedSpec.flags === 'object') {
							Object.entries(mergedSpec.flags).forEach(([flag, details]) => {
								if (argument === `--${flag.trim().toLowerCase()}`) {
									// Verbose output
									module.exports(settings).verboseLog('...Is a flag');
									
									
									// Store details
									matchedFlag = true;
									organized.flags.push(flag);
								} else if (details.shorthand && argument === `-${details.shorthand.trim().toLowerCase()}`) {
									// Verbose output
									module.exports(settings).verboseLog('...Is a flag');
									
									
									// Store details
									matchedFlag = true;
									organized.flags.push(flag);
								}
							});
						}
						
						
						// Handle no match
						if (!matchedFlag) {
							throw new Error(`Unrecognized argument: ${argument}`);
						}
					}
					
					
					// Skip further processing
					return;
				}
				
				
				// Get the files we care about
				const commandFiles = module.exports(settings).files.getFiles(`${currentPathPrefix}/${argument}`);
				
				
				// Get the command path
				const commandPath = commandFiles.filter(path => path.match(/\.js$/))[0];
				
				
				// Check if that file exists
				if (!chainBroken && fs.existsSync(commandPath) && argument.replace(/[/\\?%*:|"<>\.]/g, '') !== '') {
					// Verbose output
					module.exports(settings).verboseLog('...Is a command');
					
					
					// Add to currents
					currentPathPrefix += `/${argument}`;
					organized.command += ` ${argument}`;
				} else if (!chainBroken) {
					// Verbose output
					module.exports(settings).verboseLog('...Is data');
					
					
					// Form full data
					let fullData = settings.arguments.slice(index).join(' ');
					
					
					// Check if data is allowed
					if (!mergedSpec.data || !mergedSpec.data.allowed) {
						throw new Error(`The command "${organized.command.trim()}" does not allow data\nYou provided: ${fullData}`);
					}
					
					
					// Validate value, if necessary
					if (mergedSpec.data.values) {
						if (!mergedSpec.data.values.includes(fullData)) {
							throw new Error(`Unrecognized data for "${organized.command.trim()}": ${fullData}\nValid values: ${mergedSpec.data.values.join(', ')}`);
						}
					}
					
					if (mergedSpec.data.type) {
						if (mergedSpec.data.type === 'integer') {
							if (fullData.match(/^[0-9]+$/) !== null) {
								fullData = parseInt(fullData);
							} else {
								throw new Error(`The command "${organized.command.trim()}" expects an integer\nProvided: ${fullData}`);
							}
						} else if (mergedSpec.data.type === 'float') {
							if (fullData.match(/^[0-9]*[\.]*[0-9]*$/) !== null && fullData !== '.' && fullData !== '') {
								fullData = parseFloat(fullData);
							} else {
								throw new Error(`The command "${organized.command.trim()}" expects a float\nProvided: ${fullData}`);
							}
						} else {
							throw new Error(`Unrecognized "type": ${mergedSpec.data.type}`);
						}
					}
					
					
					// Store details
					chainBroken = true;
					organized.data = fullData;
				}
			});
			
			
			// Error if we're missing an expected value
			if (nextIsOptionValue === true) {
				throw new Error(`No value provided for ${previousOption}, which is an option, not a flag`);
			}
			
			
			// Trim command
			organized.command = organized.command.trim();
			
			
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
