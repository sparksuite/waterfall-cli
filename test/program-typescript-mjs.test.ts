/* eslint-env jest */

// Dependencies
import runProgram from './run-program';

// Initialize
const entryFile = `${__dirname}/programs/typescript-mjs/cli/entry.js`;

// Tests
describe('Built-in abilities', () => {
	test('Displays version', () => {
		return runProgram(`node ${entryFile} --version`).then(({ stdout }) => {
			expect(stdout).toContain('typescript-mjs: 1.2.3');
		});
	});
});

describe('Commands', () => {
	test('Runs a simple command successfully', () => {
		return runProgram(`node ${entryFile} example`).then(({ stdout }) => {
			expect(stdout).toContain('Ran example command');
		});
	});
});
