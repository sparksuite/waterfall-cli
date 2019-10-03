/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/pizza-ordering/cli/entry.js`;

// Tests
describe('Built-in abilities', () => {
	test('Displays version', () => {
		return runProgram(entryFile, '--version').then(({ stdout }) => {
			expect(stdout.includes('pizza-ordering: 1.2.3')).toBe(true);
		});
	});

	test('Displays version for a command', () => {
		return runProgram(entryFile, 'list --version').then(({ stdout }) => {
			expect(stdout.includes('pizza-ordering: 1.2.3')).toBe(true);
		});
	});

	test('Displays help screen', () => {
		return runProgram(entryFile, '--help').then(({ stdout }) => {
			expect(stdout.includes('Usage: node entry.js [commands]')).toBe(true);
		});
	});

	test('Displays help screen for a command', () => {
		return runProgram(entryFile, 'list --help').then(({ stdout }) => {
			expect(stdout.includes('Usage: node entry.js list [flags]')).toBe(true);
		});
	});

	test('Displays help screen when no arguments', () => {
		return runProgram(entryFile, '').then(({ stdout }) => {
			expect(stdout.includes('Usage: node entry.js [commands]')).toBe(true);
		});
	});
});
