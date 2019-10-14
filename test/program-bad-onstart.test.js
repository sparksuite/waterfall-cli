/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/bad-onstart/cli/entry.js`;

// Tests
describe('Settings', () => {
	test('Crashes with invalid `onStart` function', () => {
		return runProgram(entryFile, 'example')
			.then(() => {
				throw new Error('This program should not resolve!');
			})
			.catch(({ error, stderr }) => {
				expect(error.code).toBe(1);
				expect(stderr.includes('settings.onStart is not a function')).toBe(
					true
				);
			});
	});
});
