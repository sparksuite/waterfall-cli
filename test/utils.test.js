/* eslint-env jest */

// Dependencies
let defaultSettings = require('../dist/default-settings.js');
let utils = require('../dist/utils.js');

// Tests
describe('Utils', () => {
	describe('#processArguments()', () => {
		test('Handles normal arguments', () => {
			expect(
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
				])
			).toStrictEqual([
				'command',
				'--option1',
				'value',
				'--option2',
				'value',
				'--flag',
				'-f',
				'data1',
				'data2',
			]);
		});

		test('Handles data with special characters', () => {
			expect(
				utils({}).processArguments([
					'/path/to/node',
					'/path/to/entry.js',
					'command',
					'~!@#$%^&*()-=_+',
				])
			).toStrictEqual(['command', '~!@#$%^&*()-=_+']);
		});

		test('Handles dangling equals sign', () => {
			expect(
				utils({}).processArguments([
					'/path/to/node',
					'/path/to/entry.js',
					'command',
					'--option=',
				])
			).toStrictEqual(['command', '--option']);
		});
	});

	describe('#retrieveAppInformation()', () => {
		test('Retrieves app info', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			expect(utils(settings).retrieveAppInformation()).toStrictEqual({
				name: 'pizza-ordering',
				packageName: 'pizza-ordering',
				version: '1.2.3',
			});
		});

		test('Cannot find package.json', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				packageFilePath: '../fake.json',
			};

			expect(utils(settings).retrieveAppInformation()).toStrictEqual({
				name: null,
				packageName: null,
				version: null,
			});
		});
	});

	describe('#getMergedSpec()', () => {
		test('Gets top-level spec', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			expect(utils(settings).getMergedSpec('')).toStrictEqual({
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

		test('Gets merged spec', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			expect(utils(settings).getMergedSpec('list')).toStrictEqual({
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

		test('Complains about multiple .js files', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			expect(() => {
				utils(settings).getMergedSpec('multiple-js');
			}).toThrow(Error);
		});

		test('Complains about multiple .json files', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			expect(() => {
				utils(settings).getMergedSpec('multiple-json');
			}).toThrow(Error);
		});

		test('Complains about bad JSON', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			};

			expect(() => {
				utils(settings).getMergedSpec('bad json');
			}).toThrow(Error);
		});
	});

	describe('#organizeArguments()', () => {
		test('Handles no arguments', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: [],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: null,
				command: '',
			});
		});

		test('Handles simple command', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles simple command with data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 'toppings',
				command: 'list',
			});
		});

		test('Handles simple command with multi-word data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'two', 'words'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 'two words',
				command: 'list',
			});
		});

		test('Handles simple command with flag after data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings', '--help'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['help'],
				options: [],
				values: [],
				data: 'toppings',
				command: 'list',
			});
		});

		test('Ignores flag in data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', 'something', '--help'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 'something --help',
				command: 'order dine-in',
			});
		});

		test('Ignores options in data', () => {
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 'something --delivery-zip-code 55555',
				command: 'order dine-in',
			});
		});

		test('Handles simple command with longer data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', 'pizza1', 'pizza2'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 'pizza1 pizza2',
				command: 'order dine-in',
			});
		});

		test('Handles data with special characters', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in', '~!@#$%^&*()-=_+'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: '~!@#$%^&*()-=_+',
				command: 'order dine-in',
			});
		});

		test('Handles integer data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', '10'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 10,
				command: 'order integer-data',
			});
		});

		test('Handles float data', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123.4'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: 0.123,
				command: 'order float-data',
			});
		});

		test('Handles multiple commands', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'order dine-in',
			});
		});

		test('Handles flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles cascading flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--quiet'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles shorthand flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-q'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles multiple flags', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian', '--quiet'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['vegetarian', 'quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles cascading flag before command', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['--quiet', 'list', '--vegetarian'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: ['quiet', 'vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});

		test('Handles integer option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', '10'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: ['limit'],
				values: [10],
				data: null,
				command: 'list',
			});
		});

		test('Handles float option', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123.4'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
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

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: ['max-price'],
				values: [0.123],
				data: null,
				command: 'list',
			});
		});

		test('Handles cascading option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--delivery-zip-code', '55555'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});

		test('Handles shorthand option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-z', '55555'],
			};

			expect(utils(settings).organizeArguments()).toStrictEqual({
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});

		test('Treats bad command as data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '.'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about missing option value', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--delivery-zip-code'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about unrecognized option value type', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'to-go', '--test', 'test'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about unrecognized data type', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'to-go', 'test'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about unrecognized flag', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--fake'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about non-permitted data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'abc', '123'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about option value not in "values"', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--sort', 'fake'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about data not in "values"', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'fake'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about option value not being integer', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', '123.4'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--limit', 'abc'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about option value not being float', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', 'abc'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '123.4.5'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', '.'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--max-price', ''],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about data not being integer', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', '123.4'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'integer-data', 'abc'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});

		test('Complains about data not being float', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', 'abc'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '123.4.5'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', '.'],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'float-data', ''],
			};

			expect(() => {
				utils(settings).organizeArguments();
			}).toThrow(Error);
		});
	});

	describe('#constructInputObject()', () => {
		test('Handles combination of input', () => {
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

			expect(
				utils(settings).constructInputObject(organizedArguments)
			).toStrictEqual({
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
			});
		});

		test('Complains about missing required option', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings'],
			};

			const organizedArguments = utils(settings).organizeArguments();

			expect(() => {
				utils(settings).constructInputObject(organizedArguments);
			}).toThrow(Error);
		});

		test('Complains about missing required data', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--sort', 'popularity'],
			};

			const organizedArguments = utils(settings).organizeArguments();

			expect(() => {
				utils(settings).constructInputObject(organizedArguments);
			}).toThrow(Error);
		});
	});

	describe('#getAllProgramCommands()', () => {
		test('Gets all commands', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			};

			expect(utils(settings).getAllProgramCommands()).toStrictEqual([
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
		test('Normal string', () => {
			expect(utils({}).convertDashesToCamelCase('aaa-aaa-aaa')).toEqual(
				'aaaAaaAaa'
			);
		});

		test('With numbers', () => {
			expect(utils({}).convertDashesToCamelCase('aaa-123-aaa')).toEqual(
				'aaa123Aaa'
			);
		});
	});

	describe('#files', () => {
		test('Detects directory is directory', () => {
			expect(
				utils({}).files.isDirectory(`${__dirname}/file-tree/directory1`)
			).toEqual(true);
		});

		test('Detects file is not directory', () => {
			expect(
				utils({}).files.isDirectory(`${__dirname}/file-tree/file1.js`)
			).toEqual(false);
		});

		test('Detects file is file', () => {
			expect(utils({}).files.isFile(`${__dirname}/file-tree/file1.js`)).toEqual(
				true
			);
		});

		test('Detects directory is not file', () => {
			expect(
				utils({}).files.isFile(`${__dirname}/file-tree/directory1`)
			).toEqual(false);
		});

		test('Retrieves first level files', () => {
			expect(utils({}).files.getFiles(`${__dirname}/file-tree`)).toEqual([
				`${__dirname}/file-tree/file1.js`,
				`${__dirname}/file-tree/file2.js`,
			]);
		});

		test('Retrieves first level directories', () => {
			expect(utils({}).files.getDirectories(`${__dirname}/file-tree`)).toEqual([
				`${__dirname}/file-tree/directory1`,
				`${__dirname}/file-tree/directory2`,
			]);
		});

		test('Retrieves all directories', () => {
			expect(
				utils({}).files.getAllDirectories(`${__dirname}/file-tree`)
			).toStrictEqual([
				`${__dirname}/file-tree/directory1`,
				`${__dirname}/file-tree/directory1/directory1`,
				`${__dirname}/file-tree/directory1/directory2`,
				`${__dirname}/file-tree/directory2`,
			]);
		});

		test('GetFiles() returns empty array if path not found', () => {
			expect(utils({}).files.getFiles(`${__dirname}/fake`)).toStrictEqual([]);
		});

		test('GetDirectories() returns empty array if path not found', () => {
			expect(utils({}).files.getDirectories(`${__dirname}/fake`)).toStrictEqual(
				[]
			);
		});

		test('GetAllDirectories() returns empty array if path not found', () => {
			expect(
				utils({}).files.getAllDirectories(`${__dirname}/fake`)
			).toStrictEqual([]);
		});
	});
});
