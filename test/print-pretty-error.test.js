/* eslint-env jest */

// Dependencies
const printPrettyError = require('../dist/print-pretty-error.js');
const chalk = require('chalk');

const mockConsole = require('jest-mock-console').default;

// Tests
describe('#printPrettyError()', () => {
	test('Has the ERROR indicator', () => {
		const restoreConsole = mockConsole();
		
		let result = '';
		
		mockConsole({ error: (string) => { result += string } });
		
		printPrettyError('Error message content');
		
		expect(result).toContain(chalk.inverse.red.bold(' ERROR '));
		
		restoreConsole();
	}),
	test('Has the indent of the message', () => {
		const restoreConsole = mockConsole();
		
		let result = '';
		
		mockConsole({ error: (string) => { result += string } });
		
		printPrettyError('Error message content');
		
		expect(result).toContain('> ');
		
		restoreConsole();
	}),
	test('Has the message text', () => {
		const restoreConsole = mockConsole();
		
		let result = '';
		
		mockConsole({ error: (string) => { result += string } });
		
		printPrettyError('Error message content');
		
		expect(result).toContain('Error message content');
		
		restoreConsole();
	});
});
