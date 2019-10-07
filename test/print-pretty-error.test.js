/* eslint-env jest */

// Dependencies
const printPrettyError = require('../dist/print-pretty-error.js');
const chalk = require('chalk');
const mockConsole = require('jest-mock-console').default;

// Prepare to capture console error output
let restoreConsole;
let consoleResult;

beforeEach(() => {
	// Reset captured output
	consoleResult = '';

	// Configure capture of console.error output
	restoreConsole = mockConsole();
	mockConsole({
		error: string => {
			consoleResult += string;
		},
	});
});

afterEach(() => {
	// Revert console back to normal
	restoreConsole();
});

// Tests
describe('#printPrettyError()', () => {
	test('Has the ERROR indicator', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain(chalk.inverse.red.bold(' ERROR '));
	});

	test('Has the indent of the message', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('> ');
	});

	test('Has the message text', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('Error message content');
	});
});
