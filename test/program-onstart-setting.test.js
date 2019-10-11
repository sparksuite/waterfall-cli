/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Tests
describe('Test the onStart setting', () => {
	test('Works when not specified', async () => {
		await runProgram(
			`${__dirname}/programs/onstart-setting/cli/entry.js`,
			'list toppings --sort alphabetical'
		).then(resolved => {
			expect(resolved.stdout).toContain('Successful program termination');
		});
	});

	test('Works when given a function', async () => {
		await runProgram(
			`${__dirname}/programs/onstart-setting/cli/entry.js`,
			'list toppings --sort alphabetical',
			'',
			'onstartSettings=onStartGood'
		).then(resolved => {
			expect(resolved.stdout).toContain('This is the onStart function');
		});
	});

	test('Fails when given a string', async () => {
		await runProgram(
			`${__dirname}/programs/onstart-setting/cli/entry.js`,
			'list toppings --sort alphabetical',
			'',
			'onstartSettings=onStartBad'
		).then(
			() => {
				// runProgram promise should never 'resolve' for this test
			},
			rejected => {
				expect(rejected.stderr).toContain('settings.onStart is not a function');
			}
		);
	});
});
