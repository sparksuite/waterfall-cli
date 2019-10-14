/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/pizza-ordering/cli/entry.js`;

// Tests
describe('Built-in abilities', () => {
	test('Displays version', () => {
		return runProgram(entryFile, '--version').then(({ stdout }) => {
			expect(stdout).toContain('pizza-ordering: 1.2.3');
		});
	});

	test('Displays version for a command', () => {
		return runProgram(entryFile, 'list --version').then(({ stdout }) => {
			expect(stdout).toContain('pizza-ordering: 1.2.3');
		});
	});

	test('Displays help screen', () => {
		return runProgram(entryFile, '--help').then(({ stdout }) => {
			expect(stdout).toContain('Usage: node entry.js [commands]');
		});
	});

	test('Displays help screen for a command', () => {
		return runProgram(entryFile, 'list --help').then(({ stdout }) => {
			expect(stdout).toContain('Usage: node entry.js list [flags]');
		});
	});

	test('Displays help screen when no arguments', () => {
		return runProgram(entryFile, '').then(({ stdout }) => {
			expect(stdout).toContain('Usage: node entry.js [commands]');
		});
	});
});

describe('Commands', () => {
	test('Runs a simple command successfully', () => {
		return runProgram(entryFile, 'order dine-in').then(({ stdout }) => {
			expect(stdout).toContain('Ordered for dining in');
		});
	});
});

describe('Init settings', () => {
	test('Calls the `onStart` function', () => {
		return runProgram(entryFile, 'order dine-in').then(({ stdout }) => {
			expect(stdout).toContain('This is the onStart function');
		});
	});
});
