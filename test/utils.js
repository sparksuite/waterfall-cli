/* eslint-env mocha */

// Dependencies
const assert = require('assert');
const defaultSettings = require('../src/default-settings.js');
const utils = require('../src/utils.js');

// Tests
describe('Utils', () => {
	describe('#processArguments()', () => {
		it('Handles normal arguments', () => {
			assert.deepEqual(
				utils({}).processArguments([
					'/path/to/node',
					'/path/to/entry.js',
					'command',
					'--option1=value',
					'--option2',
					'value',
					'--flag',
					'-f',
					'data1',
					'data2',
				]),
				[
					'command',
					'--option1',
					'value',
					'--option2',
					'value',
					'--flag',
					'-f',
					'data1',
					'data2',
				]
			);
		});

		it('Handles data with special characters', () => {
			assert.deepEqual(
				utils({}).processArguments([
					'/path/to/node',
					'/path/to/entry.js',
					'command',
					'~!@#$%^&*()-=_+',
				]),
				['command', '~!@#$%^&*()-=_+']
			);
		});

		it('Handles dangling equals sign', () => {
			assert.deepEqual(
				utils({}).processArguments([
					'/path/to/node',
					'/path/to/entry.js',
					'command',
					'--option=',
				]),
				['command', '--option']
			);
		});
	});

	describe('#retrieveAppInformation()', () => {
		it('Retrieves app info', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			assert.deepEqual(utils(settings).retrieveAppInformation(), {
				name: 'pizza-ordering',
				packageName: 'pizza-ordering',
				version: '1.2.3',
			});
		});

		it('Cannot find package.json', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				packageFilePath: '../fake.json',
			};

			assert.deepEqual(utils(settings).retrieveAppInformation(), {
				name: null,
				packageName: null,
				version: null,
			});
		});
	});

	describe('#getMergedSpec()', () => {
		it('Gets top-level spec', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			assert.deepEqual(utils(settings).getMergedSpec(''), {
				data: undefined,
				description: undefined,
				flags: {
					help: {
						shorthand: 'h',
						description: 'Show help',
					},
					'non-cascading': {
						description: 'Just used for testing',
					},
					quiet: {
						cascades: true,
						description:
							'Disable interactivity, rely on default values instead',
						shorthand: 'q',
					},
					version: {
						shorthand: 'v',
						description: 'Show version',
					},
				},
				options: {
					'delivery-zip-code': {
						cascades: true,
						description: 'The delivery ZIP code, for context',
						shorthand: 'z',
					},
				},
			});
		});

		it('Gets merged spec', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			assert.deepEqual(utils(settings).getMergedSpec('list'), {
				data: {
					description: 'What you want to list',
					accepts: ['toppings', 'crusts', 'two words'],
					required: true,
				},
				description: 'List something',
				flags: {
					help: {
						shorthand: 'h',
						description: 'Show help',
					},
					quiet: {
						cascades: true,
						description:
							'Disable interactivity, rely on default values instead',
						shorthand: 'q',
					},
					vegetarian: {
						description: 'Only list vegetarian choices',
						shorthand: 'v',
					},
					version: {
						shorthand: 'v',
						description: 'Show version',
					},
				},
				options: {
					'delivery-zip-code': {
						cascades: true,
						description: 'The delivery ZIP code, for context',
						shorthand: 'z',
					},
					limit: {
						description: 'How many items to list',
						type: 'integer',
					},
					'max-price': {
						description: 'The maximum price of the items to list',
						type: 'float',
					},
					sort: {
						description: 'How to sort the list',
						accepts: ['popularity', 'alphabetical'],
						required: true,
					},
				},
			});
		});

		it('Complains about multiple .js files', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			assert.throws(() => {
				utils(settings).getMergedSpec('multiple-js');
			}, Error);
		});

		it('Complains about multiple .json files', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			assert.throws(() => {
				utils(settings).getMergedSpec('multiple-json');
			}, Error);
		});

		it('Complains about bad JSON', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			assert.throws(() => {
				utils(settings).getMergedSpec('bad json');
			}, Error);
		});
	});

	describe('#organizeArguments()', () => {
		it('Handles no arguments', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: [],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: '',
			});
		});

		it('Handles simple command', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles simple command with data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'toppings',
				command: 'list',
			});
		});

		it('Handles simple command with multi-word data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'two', 'words'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'two words',
				command: 'list',
			});
		});

		it('Handles simple command with flag after data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings', '--help'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['help'],
				options: [],
				values: [],
				data: 'toppings',
				command: 'list',
			});
		});

		it('Ignores flag in data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', 'something', '--help'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'something --help',
				command: 'order dine-in',
			});
		});

		it('Ignores options in data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: [
					'order',
					'dine-in',
					'something',
					'--delivery-zip-code',
					'55555',
				],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'something --delivery-zip-code 55555',
				command: 'order dine-in',
			});
		});

		it('Handles simple command with longer data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', 'pizza1', 'pizza2'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'pizza1 pizza2',
				command: 'order dine-in',
			});
		});

		it('Handles data with special characters', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', '~!@#$%^&*()-=_+'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: '~!@#$%^&*()-=_+',
				command: 'order dine-in',
			});
		});

		it('Handles integer data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', '10'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 10,
				command: 'order integer-data',
			});
		});

		it('Handles float data', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123.4'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 123.4,
				command: 'order float-data',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123.'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 123,
				command: 'order float-data',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 123,
				command: 'order float-data',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '.123'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 0.123,
				command: 'order float-data',
			});
		});

		it('Handles multiple commands', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'order dine-in',
			});
		});

		it('Handles flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles cascading flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--quiet'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles shorthand flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-q'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles multiple flags', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian', '--quiet'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['vegetarian', 'quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles cascading flag before command', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['--quiet', 'list', '--vegetarian'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet', 'vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		it('Handles integer option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', '10'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['limit'],
				values: [10],
				data: null,
				command: 'list',
			});
		});

		it('Handles float option', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123.4'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['max-price'],
				values: [123.4],
				data: null,
				command: 'list',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123.'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['max-price'],
				values: [123],
				data: null,
				command: 'list',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['max-price'],
				values: [123],
				data: null,
				command: 'list',
			});

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '.123'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['max-price'],
				values: [0.123],
				data: null,
				command: 'list',
			});
		});

		it('Handles cascading option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--delivery-zip-code', '55555'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});

		it('Handles shorthand option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-z', '55555'],
			};

			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});

		it('Treats bad command as data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '.'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about missing option value', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--delivery-zip-code'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about unrecognized option value type', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'to-go', '--test', 'test'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about unrecognized data type', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'to-go', 'test'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about unrecognized flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--fake'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about non-permitted data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'abc', '123'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about option value not in "values"', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--sort', 'fake'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about data not in "values"', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'fake'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about option value not being integer', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', '123.4'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', 'abc'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about option value not being float', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', 'abc'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123.4.5'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '.'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', ''],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about data not being integer', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', '123.4'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', 'abc'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});

		it('Complains about data not being float', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', 'abc'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123.4.5'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '.'],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', ''],
			};

			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});
	});

	describe('#constructInputObject()', () => {
		it('Handles combination of input', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: [
					'list',
					'--delivery-zip-code',
					'55555',
					'--sort',
					'popularity',
					'-q',
					'--vegetarian',
					'toppings',
				],
			};

			const organizedArguments = utils(settings).organizeArguments();

			assert.deepEqual(
				utils(settings).constructInputObject(organizedArguments),
				{
					command: 'list',
					data: 'toppings',
					deliveryZipCode: '55555',
					help: false,
					limit: undefined,
					maxPrice: undefined,
					quiet: true,
					sort: 'popularity',
					vegetarian: true,
					version: false,
				}
			);
		});

		it('Complains about missing required option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings'],
			};

			const organizedArguments = utils(settings).organizeArguments();

			assert.throws(() => {
				utils(settings).constructInputObject(organizedArguments);
			}, Error);
		});

		it('Complains about missing required data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--sort', 'popularity'],
			};

			const organizedArguments = utils(settings).organizeArguments();

			assert.throws(() => {
				utils(settings).constructInputObject(organizedArguments);
			}, Error);
		});
	});

	describe('#getAllProgramCommands()', () => {
		it('Gets all commands', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			assert.deepEqual(utils(settings).getAllProgramCommands(), [
				'list',
				'order',
				'order dine-in',
				'order float-data',
				'order integer-data',
				'order to-go',
			]);
		});
	});

	describe('#convertDashesToCamelCase()', () => {
		it('Normal string', () => {
			assert.equal(
				utils({}).convertDashesToCamelCase('aaa-aaa-aaa'),
				'aaaAaaAaa'
			);
		});

		it('With numbers', () => {
			assert.equal(
				utils({}).convertDashesToCamelCase('aaa-123-aaa'),
				'aaa123Aaa'
			);
		});
	});

	describe('#files', () => {
		it('Detects directory is directory', () => {
			assert.equal(
				utils({}).files.isDirectory(`${__dirname}/file-tree/directory1`),
				true
			);
		});

		it('Detects file is not directory', () => {
			assert.equal(
				utils({}).files.isDirectory(`${__dirname}/file-tree/file1.js`),
				false
			);
		});

		it('Detects file is file', () => {
			assert.equal(
				utils({}).files.isFile(`${__dirname}/file-tree/file1.js`),
				true
			);
		});

		it('Detects directory is not file', () => {
			assert.equal(
				utils({}).files.isFile(`${__dirname}/file-tree/directory1`),
				false
			);
		});

		it('Retrieves first level files', () => {
			assert.deepEqual(utils({}).files.getFiles(`${__dirname}/file-tree`), [
				`${__dirname}/file-tree/file1.js`,
				`${__dirname}/file-tree/file2.js`,
			]);
		});

		it('Retrieves first level directories', () => {
			assert.deepEqual(
				utils({}).files.getDirectories(`${__dirname}/file-tree`),
				[
					`${__dirname}/file-tree/directory1`,
					`${__dirname}/file-tree/directory2`,
				]
			);
		});

		it('Retrieves all directories', () => {
			assert.deepEqual(
				utils({}).files.getAllDirectories(`${__dirname}/file-tree`),
				[
					`${__dirname}/file-tree/directory1`,
					`${__dirname}/file-tree/directory1/directory1`,
					`${__dirname}/file-tree/directory1/directory2`,
					`${__dirname}/file-tree/directory2`,
				]
			);
		});

		it('GetFiles() returns empty array if path not found', () => {
			assert.deepEqual(utils({}).files.getFiles(`${__dirname}/fake`), []);
		});

		it('GetDirectories() returns empty array if path not found', () => {
			assert.deepEqual(utils({}).files.getDirectories(`${__dirname}/fake`), []);
		});

		it('GetAllDirectories() returns empty array if path not found', () => {
			assert.deepEqual(
				utils({}).files.getAllDirectories(`${__dirname}/fake`),
				[]
			);
		});
	});
});
