// Dependencies
const fs = require('fs');
const Fuse = require('fuse.js');
const path = require('path');
const ErrorWithoutStack = require('./error-without-stack.js');


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
						if (piece !== '') {
							processedArguments.push(piece);
						}
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
		getMergedSpec(command) {
			// Break into pieces, with entry point
			const pieces = `. ${command}`.trim().split(' ');
			
			
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
					throw new ErrorWithoutStack(`There should be exactly one .js file in: ${currentPathPrefix}`);
				}
				
				if (commandFiles.filter(path => path.match(/\.json$/)).length !== 1) {
					throw new ErrorWithoutStack(`There should be exactly one .json file in: ${currentPathPrefix}`);
				}
				
				
				// Get spec
				const specFilePath = commandFiles.filter(path => path.match(/\.json$/))[0];
				let spec = {};
				
				try {
					spec = JSON.parse(fs.readFileSync(specFilePath));
				} catch (error) {
					throw new ErrorWithoutStack(`This file has bad JSON: ${specFilePath}`);
				}
				
				
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
			const organizedArguments = {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: '',
			};
			
			let previousOption = null;
			let nextIsOptionValue = false;
			let nextValueType = null;
			let nextValueAccepts = null;
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
					
					
					// Initialize
					let value = argument;
					
					
					// Validate value, if necessary
					if (nextValueAccepts) {
						if (!nextValueAccepts.includes(value)) {
							throw new ErrorWithoutStack(`Unrecognized value for ${previousOption}: ${value}\nAccepts: ${nextValueAccepts.join(', ')}`);
						}
					}
					
					if (nextValueType) {
						if (nextValueType === 'integer') {
							if (value.match(/^[0-9]+$/) !== null) {
								value = parseInt(value, 10);
							} else {
								throw new ErrorWithoutStack(`The option ${previousOption} expects an integer\nProvided: ${value}`);
							}
						} else if (nextValueType === 'float') {
							if (value.match(/^[0-9]*[.]*[0-9]*$/) !== null && value !== '.' && value !== '') {
								value = parseFloat(value);
							} else {
								throw new ErrorWithoutStack(`The option ${previousOption} expects a float\nProvided: ${value}`);
							}
						} else {
							throw new ErrorWithoutStack(`Unrecognized "type": ${nextValueType}`);
						}
					}
					
					
					// Store and continue
					nextIsOptionValue = false;
					organizedArguments.values.push(value);
					return;
				}
				
				
				// Get merged spec for this command
				const mergedSpec = module.exports(settings).getMergedSpec(organizedArguments.command);
				
				
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
								nextValueAccepts = details.accepts;
								nextValueType = details.type;
								organizedArguments.options.push(option);
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
									organizedArguments.flags.push(flag);
								} else if (details.shorthand && argument === `-${details.shorthand.trim().toLowerCase()}`) {
									// Verbose output
									module.exports(settings).verboseLog('...Is a flag');
									
									
									// Store details
									matchedFlag = true;
									organizedArguments.flags.push(flag);
								}
							});
						}
						
						
						// Handle no match
						if (!matchedFlag) {
							throw new ErrorWithoutStack(`Unrecognized argument: ${argument}`);
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
				if (!chainBroken && fs.existsSync(commandPath) && argument.replace(/[/\\?%*:|"<>.]/g, '') !== '') {
					// Verbose output
					module.exports(settings).verboseLog('...Is a command');
					
					
					// Add to currents
					currentPathPrefix += `/${argument}`;
					organizedArguments.command += ` ${argument}`;
				} else if (!chainBroken) {
					// Verbose output
					module.exports(settings).verboseLog('...Is data');
					
					
					// Form full data
					let fullData = settings.arguments.slice(index).join(' ');
					
					
					// Check if data is allowed
					if (!mergedSpec.data || !mergedSpec.data.description) {
						// Get all commands in program
						const mainDir = path.dirname(settings.mainFilename);
						let commands = module.exports(settings).files.getAllDirectories(mainDir);
						commands = commands.map(file => file.replace(`${mainDir}/`, ''));
						commands = commands.map(file => file.replace(/\.js$/, ''));
						commands = commands.map(file => file.replace(/\//, ' '));
						
						
						// Search for the best match
						const fuse = new Fuse(commands, {
							shouldSort: true,
							threshold: 0.4,
							tokenize: true,
							matchAllTokens: true,
							maxPatternLength: 32,
							minMatchCharLength: 1,
						});
						
						const results = fuse.search(`${organizedArguments.command} ${fullData}`.trim());
						let bestMatch = null;
						
						if (results.length) {
							bestMatch = commands[results[0]];
						}
						
						
						// Determine command
						const command = `${settings.usageCommand}${organizedArguments.command}`;
						
						
						// Form error message
						let errorMessage = `You provided ${fullData.bold} to ${command.bold}\n`;
						
						if (bestMatch) {
							errorMessage += 'If you were trying to pass in data, this command does not accept data\n';
							errorMessage += `If you were trying to use a command, did you mean ${settings.usageCommand.bold} ${bestMatch.bold}?\n`;
						} else {
							errorMessage += 'However, this command does not accept data\n';
						}
						
						errorMessage += `For more guidance, see: ${command} --help`;
						
						
						// Throw error
						throw new ErrorWithoutStack(errorMessage);
					}
					
					
					// Validate data, if necessary
					if (mergedSpec.data.accepts) {
						if (!mergedSpec.data.accepts.includes(fullData)) {
							throw new ErrorWithoutStack(`Unrecognized data for "${organizedArguments.command.trim()}": ${fullData}\nAccepts: ${mergedSpec.data.accepts.join(', ')}`);
						}
					}
					
					if (mergedSpec.data.type) {
						if (mergedSpec.data.type === 'integer') {
							if (fullData.match(/^[0-9]+$/) !== null) {
								fullData = parseInt(fullData, 10);
							} else {
								throw new ErrorWithoutStack(`The command "${organizedArguments.command.trim()}" expects integer data\nProvided: ${fullData}`);
							}
						} else if (mergedSpec.data.type === 'float') {
							if (fullData.match(/^[0-9]*[.]*[0-9]*$/) !== null && fullData !== '.' && fullData !== '') {
								fullData = parseFloat(fullData);
							} else {
								throw new ErrorWithoutStack(`The command "${organizedArguments.command.trim()}" expects float data\nProvided: ${fullData}`);
							}
						} else {
							throw new ErrorWithoutStack(`Unrecognized "type": ${mergedSpec.data.type}`);
						}
					}
					
					
					// Store details
					chainBroken = true;
					organizedArguments.data = fullData;
				}
			});
			
			
			// Error if we're missing an expected value
			if (nextIsOptionValue === true) {
				throw new ErrorWithoutStack(`No value provided for ${previousOption}, which is an option, not a flag`);
			}
			
			
			// Trim command
			organizedArguments.command = organizedArguments.command.trim();
			
			
			// Return
			return organizedArguments;
		},
		
		
		// Construct a full input object
		constructInputObject(organizedArguments) {
			// Initialize
			const inputObject = {};
			
			
			// Get merged spec for this command
			const mergedSpec = module.exports(settings).getMergedSpec(organizedArguments.command);
			
			
			// Loop over each component and store
			Object.entries(mergedSpec.flags).forEach(([flag]) => {
				const camelCaseKey = module.exports(settings).convertDashesToCamelCase(flag);
				inputObject[camelCaseKey] = organizedArguments.flags.includes(flag);
			});
			
			Object.entries(mergedSpec.options).forEach(([option, details]) => {
				const camelCaseKey = module.exports(settings).convertDashesToCamelCase(option);
				const optionIndex = organizedArguments.options.indexOf(option);
				inputObject[camelCaseKey] = organizedArguments.values[optionIndex];
				
				if (details.required && !organizedArguments.options.includes(option)) {
					throw new ErrorWithoutStack(`The --${option} option is required`);
				}
			});
			
			
			// Store data
			inputObject.data = organizedArguments.data;
			
			if (mergedSpec.data && mergedSpec.data.required && !organizedArguments.data) {
				throw new ErrorWithoutStack('Data is required');
			}
			
			
			// Return
			return inputObject;
		},
		
		
		// Convert a string from aaa-aaa-aaa to aaaAaaAaa
		convertDashesToCamelCase(string) {
			return string.replace(/-(.)/g, g => g[1].toUpperCase());
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
