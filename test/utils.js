/* eslint-env mocha */


// Dependencies
const assert = require('assert');
const defaultSettings = require('../src/default-settings.js');
const utils = require('../src/utils.js');


// Set environment variable
process.env.TEST_MODE = 'true';


// Tests
describe('Utils', () => {
	describe('#processArguments()', () => {
		it('handles normal arguments', () => {
			assert.deepEqual(utils({}).processArguments([
				'/path/to/node',
				'/path/to/entry.js',
				'command',
				'--option=value',
				'--flag',
				'-f',
				'data1',
				'data2',
			]), [
				'command',
				'--option',
				'value',
				'--flag',
				'-f',
				'data1',
				'data2',
			]);
		});
		
		it('handles data with special characters', () => {
			assert.deepEqual(utils({}).processArguments([
				'/path/to/node',
				'/path/to/entry.js',
				'command',
				'~!@#$%^&*()-=_+',
			]), [
				'command',
				'~!@#$%^&*()-=_+',
			]);
		});
	});
	
	describe('#retrieveAppInformation()', () => {
		it('retrieves app info', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			});
			
			assert.deepEqual(utils(settings).retrieveAppInformation(), {
				name: 'pizza-ordering',
				version: '1.2.3',
			});
		});
		
		it('cannot find package.json', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				packageFilePath: '../fake.json',
			});
			
			assert.deepEqual(utils(settings).retrieveAppInformation(), {
				name: null,
				version: null,
			});
		});
	});
	
	describe('#getMergedSpecForCommand()', () => {
		it('gets top-level spec', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			});
			
			assert.deepEqual(utils(settings).getMergedSpecForCommand('.'), {
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
		
		it('gets merged spec', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
			});
			
			assert.deepEqual(utils(settings).getMergedSpecForCommand('. list'), {
				data: {
					allowed: true,
					values: ['toppings', 'crusts'],
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
				},
			});
		});
		
		it('complains about multiple .js files', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			});
			
			assert.throws(() => {
				utils(settings).getMergedSpecForCommand('. multiple-js');
			}, Error);
		});
		
		it('complains about multiple .json files', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/bad-structure/cli/entry.js`,
			});
			
			assert.throws(() => {
				utils(settings).getMergedSpecForCommand('. multiple-json');
			}, Error);
		});
	});
	
	describe('#organizeArguments()', () => {
		it('handles no arguments', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: [],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: '',
			});
		});
		
		it('handles simple command', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles simple command with data', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'toppings',
				command: 'list',
			});
		});
		
		it('handles simple command with longer data', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', 'toppings', 'crusts'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: 'toppings crusts',
				command: 'list',
			});
		});
		
		it('handles data with special characters', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '~!@#$%^&*()-=_+'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: '~!@#$%^&*()-=_+',
				command: 'list',
			});
		});
		
		it('handles multiple commands', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'dine-in'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: [],
				values: [],
				data: null,
				command: 'order dine-in',
			});
		});
		
		it('handles flag', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles cascading flag', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--quiet'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles shorthand flag', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-q'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles multiple flags', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--vegetarian', '--quiet'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['vegetarian', 'quiet'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles cascading flag before command', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['--quiet', 'list', '--vegetarian'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: ['quiet', 'vegetarian'],
				options: [],
				values: [],
				data: null,
				command: 'list',
			});
		});
		
		it('handles cascading option', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--delivery-zip-code', '55555'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});
		
		it('handles shorthand option', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '-z', '55555'],
			});
			
			assert.deepEqual(utils(settings).organizeArguments(), {
				flags: [],
				options: ['delivery-zip-code'],
				values: ['55555'],
				data: null,
				command: 'list',
			});
		});
		
		it('complains about unrecognized flag', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['list', '--fake'],
			});
			
			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});
		
		it('complains about non-permitted data', () => {
			const settings = Object.assign({}, defaultSettings, {
				mainFilename: `${__dirname}/programs/pizza-ordering/cli/entry.js`,
				arguments: ['order', 'abc', '123'],
			});
			
			assert.throws(() => {
				utils(settings).organizeArguments();
			}, Error);
		});
	});
	
	describe('#files', () => {
		it('detects directory is directory', () => {
			assert.equal(utils({}).files.isDirectory(`${__dirname}/file-tree/directory1`), true);
		});
		
		it('detects file is not directory', () => {
			assert.equal(utils({}).files.isDirectory(`${__dirname}/file-tree/file1.js`), false);
		});
		
		it('detects file is file', () => {
			assert.equal(utils({}).files.isFile(`${__dirname}/file-tree/file1.js`), true);
		});
		
		it('detects directory is not file', () => {
			assert.equal(utils({}).files.isFile(`${__dirname}/file-tree/directory1`), false);
		});
		
		it('retrieves first level files', () => {
			assert.deepEqual(utils({}).files.getFiles(`${__dirname}/file-tree`), [
				`${__dirname}/file-tree/file1.js`,
				`${__dirname}/file-tree/file2.js`,
			]);
		});
		
		it('retrieves first level directories', () => {
			assert.deepEqual(utils({}).files.getDirectories(`${__dirname}/file-tree`), [
				`${__dirname}/file-tree/directory1`,
				`${__dirname}/file-tree/directory2`,
			]);
		});
		
		it('retrieves all directories', () => {
			assert.deepEqual(utils({}).files.getAllDirectories(`${__dirname}/file-tree`), [
				`${__dirname}/file-tree/directory1`,
				`${__dirname}/file-tree/directory1/directory1`,
				`${__dirname}/file-tree/directory1/directory2`,
				`${__dirname}/file-tree/directory2`,
			]);
		});
		
		it('getFiles() returns empty array if path not found', () => {
			assert.deepEqual(utils({}).files.getFiles(`${__dirname}/fake`), []);
		});
		
		it('getDirectories() returns empty array if path not found', () => {
			assert.deepEqual(utils({}).files.getDirectories(`${__dirname}/fake`), []);
		});
		
		it('getAllDirectories() returns empty array if path not found', () => {
			assert.deepEqual(utils({}).files.getAllDirectories(`${__dirname}/fake`), []);
		});
	});
});
