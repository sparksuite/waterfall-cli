/* eslint-env jest */

// Dependencies
const printPrettyError = require('../dist/print-pretty-error').default;
const chalk = require('../dist/chalk').default;

// Holders for capturing console.error output
let spy;
let consoleResult;

// Ask Jest to capture console.error output
beforeEach(() => {
	// Reset captured output
	consoleResult = '';

	// Configure capture of console.error output
	spy = jest.spyOn(console, 'error').mockImplementation((text) => (consoleResult += text));
});

// Ask Jest to restore original console.error handler
afterEach(() => {
	// Revert console back to normal
	spy.mockRestore();
});

// Tests
describe('#printPrettyError()', () => {
	test('Has the "ERROR" title', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain(chalk.inverse.red.bold(' ERROR '));
	});

	test('Has the indent marker (">")', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('> ');
	});

	test('Displays the message text', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('Error message content');
	});

	test('Returns the message text', () => {
		expect(printPrettyError('Error message content')).toContain('Error message content');
	});
});
