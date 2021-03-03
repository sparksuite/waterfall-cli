/* eslint-env jest */
/* eslint no-control-regex: "off" */

// Dependencies
import defaultSettings from '../src/default-settings';
import screens from '../src/screens';
import path from 'path';

// Remove ANSI formatting
function removeFormatting(text: string) {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

// Tests
describe('#version()', () => {
	it('Full version screen', () => {
		const settings = {
			...defaultSettings,
			app: {
				name: 'Example program',
				version: '1.2.3',
			},
		};

		expect(removeFormatting(screens(settings).version())).toContain('Example program: 1.2.3');
	});

	it('Missing name', () => {
		const settings = {
			...defaultSettings,
			app: {
				name: undefined,
				version: '1.2.3',
			},
		};

		expect(removeFormatting(screens(settings).version())).toContain('1.2.3');
		expect(removeFormatting(screens(settings).version())).not.toContain(':');
	});
});

describe('#help()', () => {
	it('Description line', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('Description: List something');
	});

	it('Usage line (commands + flags + options)', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'Usage: node entry.js [commands] [flags] [options]'
		);
	});

	it('Usage line (flags + options + data)', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'Usage: node entry.js list [flags] [options] [data]'
		);
	});

	it('Flags - header', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('FLAGS:');
	});

	it('Flags - non-cascading', async () => {
		let settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--non-cascading');

		settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).not.toContain('--non-cascading');
	});

	it('Flags - cascading', async () => {
		let settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--quiet');

		settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--quiet');
	});

	it('Flags - shorthand', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--quiet, -q');
	});

	it('Flags - description', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'Disable interactivity, rely on default values instead'
		);
	});

	it('Options - header', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('OPTIONS:');
	});

	it('Options - cascading', async () => {
		let settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--delivery-zip-code');

		settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--delivery-zip-code');
	});

	it('Options - shorthand', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('--delivery-zip-code, -z');
	});

	it('Options - description', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('The delivery ZIP code, for context');
	});

	it('Options - description (type)', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'The maximum price of the items to list (float)'
		);
	});

	it('Options - description (required + accepts)', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'How to sort the list (required) (accepts: popularity, alphabetical)'
		);
	});

	it('Commands - header', async () => {
		let settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('COMMANDS:');

		settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).not.toContain('COMMANDS:');
	});

	it('Commands - description', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).toContain('Order a pizza');
	});

	it('Data - header', async () => {
		let settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('DATA:');

		settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
		};

		expect(removeFormatting(await screens(settings).help())).not.toContain('DATA:');
	});

	it('Data - description', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['order', 'dine-in'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('What type of pizza to order');
	});

	it('Data - no description', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['order', 'descriptionless-data'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain('DATA:');

		expect(removeFormatting(await screens(settings).help())).toContain('This command allows data to be passed in');
	});

	it('Data - description (required + accepts)', async () => {
		const settings = {
			...defaultSettings,
			mainFilename: path.normalize(`${__dirname}/../test-projects/pizza-ordering/cli/entry.js`),
			usageCommand: 'node entry.js',
			arguments: ['list'],
		};

		expect(removeFormatting(await screens(settings).help())).toContain(
			'What you want to list (required) (accepts: toppings, crusts, two words)'
		);
	});
});
