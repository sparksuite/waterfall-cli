/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/typescript/cli/entry.js`;

// Tests
describe('Built-in abilities', () => {
	test('Displays version', () => {
		return runProgram(entryFile, '--version').then(({ stdout }) => {
			expect(stdout.includes('typescript: 1.2.3')).toBe(true);
		});
	});
});

describe('Commands', () => {
	test('Runs a simple command successfully', () => {
		return runProgram(entryFile, 'example').then(({ stdout }) => {
			expect(stdout.includes('Ran example command')).toBe(true);
		});
	});
});
