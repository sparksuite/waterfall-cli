/* eslint-env mocha */
/* eslint no-control-regex: "off" */


// Dependencies
const assert = require('assert');
const defaultSettings = require('../src/default-settings.js');
const screens = require('../src/screens.js');


// Set environment variable
process.env.TEST_MODE = 'true';


// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}


// Tests
describe('Screens', () => {
	describe('#version()', () => {
		it('full version screen', () => {
			const settings = Object.assign({}, defaultSettings, {
				app: {
					name: 'Example program',
					version: '1.2.3',
				},
			});
			
			assert.equal(removeFormatting(screens(settings).version()).includes('Example program: 1.2.3'), true);
		});
		
		it('missing name', () => {
			const settings = Object.assign({}, defaultSettings, {
				app: {
					name: undefined,
					version: '1.2.3',
				},
			});
			
			assert.equal(removeFormatting(screens(settings).version()).includes('1.2.3'), true);
			assert.equal(removeFormatting(screens(settings).version()).includes(':'), false);
		});
	});
	
	describe('#help()', () => {
		it('description line', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Description: List something'), true);
		});
		
		it('usage line (commands + flags + options)', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Usage: node entry.js [commands] [flags] [options]'), true);
		});
		
		it('usage line (flags + options + data)', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Usage: node entry.js list [flags] [options] [data]'), true);
		});
		
		it('flags - header', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('FLAGS:'), true);
		});
		
		it('flags - non-cascading', () => {
			let settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--non-cascading'), true);
			
			settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--non-cascading'), false);
		});
		
		it('flags - cascading', () => {
			let settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet'), true);
			
			settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet'), true);
		});
		
		it('flags - shorthand', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--quiet, -q'), true);
		});
		
		it('flags - description', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Disable interactivity, rely on default values instead'), true);
		});
		
		it('options - header', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('OPTIONS:'), true);
		});
		
		it('options - cascading', () => {
			let settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code'), true);
			
			settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code'), true);
		});
		
		it('options - shorthand', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('--delivery-zip-code, -z'), true);
		});
		
		it('options - description', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('The delivery ZIP code, for context'), true);
		});
		
		it('options - description (type)', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('The maximum price of the items to list (float)'), true);
		});
		
		it('options - description (required + accepts)', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('How to sort the list (required) (accepts: popularity, alphabetical)'), true);
		});
		
		it('commands - header', () => {
			let settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('COMMANDS:'), true);
			
			settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('COMMANDS:'), false);
		});
		
		it('commands - description', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('Order a pizza'), true);
		});
		
		it('data - header', () => {
			let settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('DATA:'), true);
			
			settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('DATA:'), false);
		});
		
		it('data - description', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['order', 'dine-in'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('What type of pizza to order'), true);
		});
		
		it('data - description (required + accepts)', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				usageCommand: `node entry.js`,
				arguments: ['list'],
			});
			
			assert.equal(removeFormatting(screens(settings).help()).includes('What you want to list (required) (accepts: toppings, crusts)'), true);
		});
	});
});
