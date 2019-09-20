/* eslint-env mocha */
/* eslint no-control-regex: "off" */


// Dependencies
const assert = require('assert');
const defaultSettings = require('../src/default-settings.js');
const screens = require('../src/screens.js');


// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}


// Tests
describe('Screens', () => {
	describe('#version()', () => {
		it('Full version screen', () => {
			const settings = {
				...defaultSettings,
				app: {
					name: 'Example program',
					version: '1.2.3',
				},
			};
			
			assert.equal(removeFormatting(screens(settings).version()).includes('Example program: 1.2.3'), true);
		});
		
		it('Missing name', () => {
			const settings = {
				...defaultSettings,
				app: {
					name: undefined,
					version: '1.2.3',
				},
			};
			
			assert.equal(removeFormatting(screens(settings).version()).includes('1.2.3'), true);
			assert.equal(removeFormatting(screens(settings).version()).includes(':'), false);
		});
	});
	
	describe('#help()', () => {
		it('Description line', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Description: List something'), true);
		});
		
		it('Usage line (commands + flags + options)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Usage: node entry.js [commands] [flags] [options]'), true);
		});
		
		it('Usage line (flags + options + data)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Usage: node entry.js list [flags] [options] [data]'), true);
		});
		
		it('Flags - header', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('FLAGS:'), true);
		});
		
		it('Flags - non-cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--non-cascading'), true);
			
			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--non-cascading'), false);
		});
		
		it('Flags - cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet'), true);
			
			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet'), true);
		});
		
		it('Flags - shorthand', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet, -q'), true);
		});
		
		it('Flags - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Disable interactivity, rely on default values instead'), true);
		});
		
		it('Options - header', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('OPTIONS:'), true);
		});
		
		it('Options - cascading', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code'), true);
			
			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code'), true);
		});
		
		it('Options - shorthand', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code, -z'), true);
		});
		
		it('Options - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('The delivery ZIP code, for context'), true);
		});
		
		it('Options - description (type)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('The maximum price of the items to list (float)'), true);
		});
		
		it('Options - description (required + accepts)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('How to sort the list (required) (accepts: popularity, alphabetical)'), true);
		});
		
		it('Commands - header', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('COMMANDS:'), true);
			
			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('COMMANDS:'), false);
		});
		
		it('Commands - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Order a pizza'), true);
		});
		
		it('Data - header', () => {
			let settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('DATA:'), true);
			
			settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('DATA:'), false);
		});
		
		it('Data - description', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['order', 'dine-in'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('What type of pizza to order'), true);
		});
		
		it('Data - description (required + accepts)', () => {
			const settings = {
				...defaultSettings,
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: 'node entry.js',
				arguments: ['list'],
			};
			
			assert.equal(removeFormatting(screens(settings).help()).includes('What you want to list (required) (accepts: toppings, crusts, two words)'), true);
		});
	});
});
