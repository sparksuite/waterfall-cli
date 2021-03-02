/* eslint-env jest */

// Dependencies
import printPrettyError from '../src/print-pretty-error';
import chalk from '../src/chalk';

// Holders for capturing console.error output
let spy: ReturnType<typeof jest.spyOn>;
let consoleResult = '';

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
	it('Has the "ERROR" title', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain(chalk.inverse.red.bold(' ERROR '));
	});

	it('Has the indent marker (">")', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('> ');
	});

	it('Displays the message text', () => {
		printPrettyError('Error message content');

		expect(consoleResult).toContain('Error message content');
	});

	it('Returns the message text', () => {
		expect(printPrettyError('Error message content')).toEqual('Error message content');
	});
});
