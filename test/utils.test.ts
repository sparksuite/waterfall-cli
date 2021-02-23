/* eslint-env jest */

// Dependencies
import defaultSettings from '../src/default-settings';
import utils from '../src/utils';

const settingsBadStructure = {
	...defaultSettings,
	mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
};

const settingsPizzaOrdering = {
	...defaultSettings,
	mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
};

// Tests
describe('#retrieveAppInformation()', () => {
	test('Retrieves app info', () => {
		expect(utils(settingsPizzaOrdering).retrieveAppInformation()).toStrictEqual({
			name: 'pizza-ordering',
			packageName: 'pizza-ordering',
			version: '1.2.3',
		});
	});

	test('Cannot find package.json', () => {
		const settings = {
			...settingsPizzaOrdering,
			packageFilePath: '../fake.json',
		};

		expect(utils(settings).retrieveAppInformation()).toStrictEqual({});
	});
});

describe('#getMergedSpec()', () => {
	test('Gets top-level spec', async () => {
		expect(await utils(settingsPizzaOrdering).getMergedSpec('')).toStrictEqual({
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
					description: 'Disable interactivity, rely on default values instead',
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

	test('Gets merged spec', async () => {
		expect(await utils(settingsPizzaOrdering).getMergedSpec('list')).toStrictEqual({
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
					description: 'Disable interactivity, rely on default values instead',
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

	test('Gets another merged spec', async () => {
		expect(await utils(settingsPizzaOrdering).getMergedSpec('order')).toStrictEqual({
			data: undefined,
			description: 'Order a pizza',
			flags: {
				'gluten-free': {
					description: "Let the kitchen know you're gluten free",
				},
				help: {
					shorthand: 'h',
					description: 'Show help',
				},
				quiet: {
					cascades: true,
					description: 'Disable interactivity, rely on default values instead',
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

	test('Complains about multiple spec files', async () => {
		return expect(utils(settingsBadStructure).getMergedSpec('multiple-specs')).rejects.toThrow();
	});

	test('Complains about invalid spec JS', () => {
		return expect(utils(settingsBadStructure).getMergedSpec('invalid-spec-js')).rejects.toThrow();
	});
});

describe('#organizeArguments()', () => {
	test('Handles no arguments', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: [],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			command: '',
		});
	});

	test('Handles simple command', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles simple command with data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', 'toppings'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 'toppings',
			command: 'list',
		});
	});

	test('Handles simple command with multi-word data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', 'two', 'words'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 'two words',
			command: 'list',
		});
	});

	test('Handles simple command with flag after data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', 'toppings', '--help'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['help'],
			options: [],
			values: [],
			data: 'toppings',
			command: 'list',
		});
	});

	test('Ignores flag in data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in', 'something', '--help'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 'something --help',
			command: 'order dine-in',
		});
	});

	test('Ignores options in data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in', 'something', '--delivery-zip-code', '55555'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 'something --delivery-zip-code 55555',
			command: 'order dine-in',
		});
	});

	test('Handles simple command with longer data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in', 'pizza1', 'pizza2'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 'pizza1 pizza2',
			command: 'order dine-in',
		});
	});

	test('Handles data with special characters', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in', '~!@#$%^&*()-=_+'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: '~!@#$%^&*()-=_+',
			command: 'order dine-in',
		});
	});

	test('Handles integer data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'integer-data', '10'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 10,
			command: 'order integer-data',
		});
	});

	test('Handles float data', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '123.4'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 123.4,
			command: 'order float-data',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '123.'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 123,
			command: 'order float-data',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '123'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 123,
			command: 'order float-data',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '.123'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			data: 0.123,
			command: 'order float-data',
		});
	});

	test('Handles multiple commands', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: [],
			values: [],
			command: 'order dine-in',
		});
	});

	test('Handles flag', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--vegetarian'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['vegetarian'],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles cascading flag', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--quiet'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['quiet'],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles shorthand flag', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '-q'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['quiet'],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles multiple flags', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--vegetarian', '--quiet'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['vegetarian', 'quiet'],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles cascading flag before command', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['--quiet', 'list', '--vegetarian'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: ['quiet', 'vegetarian'],
			options: [],
			values: [],
			command: 'list',
		});
	});

	test('Handles integer option', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--limit', '10'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['limit'],
			values: [10],
			command: 'list',
		});
	});

	test('Handles float option', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '123.4'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['max-price'],
			values: [123.4],
			command: 'list',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '123.'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['max-price'],
			values: [123],
			command: 'list',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '123'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['max-price'],
			values: [123],
			command: 'list',
		});

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '.123'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['max-price'],
			values: [0.123],
			command: 'list',
		});
	});

	test('Handles cascading option', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--delivery-zip-code', '55555'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['delivery-zip-code'],
			values: ['55555'],
			command: 'list',
		});
	});

	test('Handles shorthand option', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '-z', '55555'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			flags: [],
			options: ['delivery-zip-code'],
			values: ['55555'],
			command: 'list',
		});
	});

	test('Treats bad command as data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '.'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about missing option value', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--delivery-zip-code'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about unrecognized option value type', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'to-go', '--test', 'test'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about unrecognized data type', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'to-go', 'test'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about unrecognized flag', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--fake'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about non-permitted data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'abc', '123'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about option value not in "values"', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--sort', 'fake'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about data not in "values"', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', 'fake'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about option value not being integer', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--limit', '123.4'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--limit', 'abc'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about option value not being float', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', 'abc'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '123.4.5'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', '.'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--max-price', ''],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about data not being integer', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'integer-data', '123.4'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'integer-data', 'abc'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about data not being float', async () => {
		let settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', 'abc'],
		};

		await expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '123.4.5'],
		};

		await expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', '.'],
		};

		await expect(utils(settings).organizeArguments()).rejects.toThrow();

		settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'float-data', ''],
		};

		await expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Complains about unexpected pass-through arguments ', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'dine-in', '--', '--pass-through-flag', 'pass-through-option=value', 'pass-through-data'],
		};

		return expect(utils(settings).organizeArguments()).rejects.toThrow();
	});

	test('Handles having pass-through arguments', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['order', 'to-go', '--', '--pass-through-flag', 'pass-through-option=value', 'pass-through-data'],
		};

		expect(await utils(settings).organizeArguments()).toStrictEqual({
			command: 'order to-go',
			flags: [],
			options: [],
			passThrough: ['--pass-through-flag', 'pass-through-option=value', 'pass-through-data'],
			values: [],
		});
	});
});

describe('#constructInputObject()', () => {
	test('Handles combination of input', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--delivery-zip-code', '55555', '--sort', 'popularity', '-q', '--vegetarian', 'toppings'],
		};

		const organizedArguments = await utils(settings).organizeArguments();

		expect(await utils(settings).constructInputObject(organizedArguments)).toStrictEqual({
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

	test('Complains about missing required option', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', 'toppings'],
		};

		const organizedArguments = await utils(settings).organizeArguments();

		return expect(utils(settings).constructInputObject(organizedArguments)).rejects.toThrow();
	});

	test('Complains about missing required data', async () => {
		const settings = {
			...settingsPizzaOrdering,
			arguments: ['list', '--sort', 'popularity'],
		};

		const organizedArguments = await utils(settings).organizeArguments();

		return expect(utils(settings).constructInputObject(organizedArguments)).rejects.toThrow();
	});
});

describe('#getAllProgramCommands()', () => {
	test('Gets all commands', () => {
		expect(utils(settingsPizzaOrdering).getAllProgramCommands()).toStrictEqual([
			'list',
			'order',
			'order descriptionless-data',
			'order dine-in',
			'order float-data',
			'order integer-data',
			'order to-go',
		]);
	});
});

describe('#convertDashesToCamelCase()', () => {
	test('Normal string', () => {
		expect(utils(settingsPizzaOrdering).convertDashesToCamelCase('aaa-aaa-aaa')).toEqual('aaaAaaAaa');
	});

	test('With numbers', () => {
		expect(utils(settingsPizzaOrdering).convertDashesToCamelCase('aaa-123-aaa')).toEqual('aaa123Aaa');
	});
});

describe('#files', () => {
	test('Detects directory is directory', () => {
		expect(utils(settingsPizzaOrdering).files.isDirectory(`${__dirname}/file-tree/directory1`)).toEqual(true);
	});

	test('Detects file is not directory', () => {
		expect(utils(settingsPizzaOrdering).files.isDirectory(`${__dirname}/file-tree/file1.js`)).toEqual(false);
	});

	test('Detects file is file', () => {
		expect(utils(settingsPizzaOrdering).files.isFile(`${__dirname}/file-tree/file1.js`)).toEqual(true);
	});

	test('Detects directory is not file', () => {
		expect(utils(settingsPizzaOrdering).files.isFile(`${__dirname}/file-tree/directory1`)).toEqual(false);
	});

	test('Retrieves first level files', () => {
		expect(utils(settingsPizzaOrdering).files.getFiles(`${__dirname}/file-tree`)).toEqual([
			`${__dirname}/file-tree/file1.js`,
			`${__dirname}/file-tree/file2.js`,
		]);
	});

	test('Retrieves all directories', () => {
		expect(utils(settingsPizzaOrdering).files.getAllDirectories(`${__dirname}/file-tree`)).toStrictEqual([
			`${__dirname}/file-tree/directory1`,
			`${__dirname}/file-tree/directory1/directory1`,
			`${__dirname}/file-tree/directory1/directory2`,
			`${__dirname}/file-tree/directory2`,
		]);
	});

	test('Retrieves command spec', async () => {
		expect(
			await utils(settingsPizzaOrdering).files.getCommandSpec(`${__dirname}/programs/pizza-ordering/cli`)
		).toStrictEqual({
			flags: {
				'non-cascading': {
					description: 'Just used for testing',
				},
				quiet: {
					cascades: true,
					description: 'Disable interactivity, rely on default values instead',
					shorthand: 'q',
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

	test('getFiles() returns empty array if path not found', () => {
		expect(utils(settingsPizzaOrdering).files.getFiles(`${__dirname}/fake`)).toStrictEqual([]);
	});

	test('getAllDirectories() returns empty array if path not found', () => {
		expect(utils(settingsPizzaOrdering).files.getAllDirectories(`${__dirname}/fake`)).toStrictEqual([]);
	});

	test('getCommandSpec() throws an error if path not found', () => {
		return expect(utils(settingsPizzaOrdering).files.getCommandSpec(`${__dirname}/fake`)).rejects.toThrow();
	});

	test('getCommandSpec() throws an error if there are multiple spec files', () => {
		return expect(
			utils(settingsBadStructure).files.getCommandSpec(`${__dirname}/programs/bad-structure/cli/multiple-specs`)
		).rejects.toThrow();
	});
});
