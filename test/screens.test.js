/* eslint-env jest */
/* eslint no-control-regex: "off" */

// Dependencies
require('colors');
const defaultSettings = require('../dist/default-settings.js');
const screens = require('../dist/screens.js');

// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		''
	);
}

// Tests
describe('Screens', () => {
	describe('#version()', () => {
		test('Full version screen', () => {
			const settings = {
				...defaultSettings,
				app: {
					name: 'Example program',
					version: '1.2.3',
				},
			};

			expect(
				removeFormatting(screens(settings).version()).includes(
					'Example program: 1.2.3'
				)
			).toBe(true);
		});

		test('Missing name', () => {
			const settings = {
				...defaultSettings,
				app: {
					name: undefined,
					version: '1.2.3',
				},
			};

			expect(
				removeFormatting(screens(settings).version()).includes('1.2.3')
			).toBe(true);
			expect(removeFormatting(screens(settings).version()).includes(':')).toBe(
				false
			);
		});
	});

	describe('#help()', () => {
		test('Description line', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'Description: List something'
				)
			).toBe(true);
		});

		test('Usage line (commands + flags + options)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'Usage: node entry.js [commands] [flags] [options]'
				)
			).toBe(true);
		});

		test('Usage line (flags + options + data)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'Usage: node entry.js list [flags] [options] [data]'
				)
			).toBe(true);
		});

		test('Flags - header', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('FLAGS:')
			).toBe(true);
		});

		test('Flags - non-cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('--non-cascading')
			).toBe(true);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes('--non-cascading')
			).toBe(false);
		});

		test('Flags - cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('--quiet')
			).toBe(true);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes('--quiet')
			).toBe(true);
		});

		test('Flags - shorthand', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('--quiet, -q')
			).toBe(true);
		});

		test('Flags - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'Disable interactivity, rely on default values instead'
				)
			).toBe(true);
		});

		test('Options - header', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('OPTIONS:')
			).toBe(true);
		});

		test('Options - cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'--delivery-zip-code'
				)
			).toBe(true);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'--delivery-zip-code'
				)
			).toBe(true);
		});

		test('Options - shorthand', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'--delivery-zip-code, -z'
				)
			).toBe(true);
		});

		test('Options - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'The delivery ZIP code, for context'
				)
			).toBe(true);
		});

		test('Options - description (type)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'The maximum price of the items to list (float)'
				)
			).toBe(true);
		});

		test('Options - description (required + accepts)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'How to sort the list (required) (accepts: popularity, alphabetical)'
				)
			).toBe(true);
		});

		test('Commands - header', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('COMMANDS:')
			).toBe(true);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes('COMMANDS:')
			).toBe(false);
		});

		test('Commands - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(
				removeFormatting(screens(settings).help()).includes('Order a pizza')
			).toBe(true);
		});

		test('Data - header', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(removeFormatting(screens(settings).help()).includes('DATA:')).toBe(
				true
			);

			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};

			expect(removeFormatting(screens(settings).help()).includes('DATA:')).toBe(
				false
			);
		});

		test('Data - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['order', 'dine-in'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'What type of pizza to order'
				)
			).toBe(true);
		});

		test('Data - description (required + accepts)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};

			expect(
				removeFormatting(screens(settings).help()).includes(
					'What you want to list (required) (accepts: toppings, crusts, two words)'
				)
			).toBe(true);
		});
	});
});
