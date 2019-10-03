/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/pizza-ordering/cli/entry.js`;

// Tests
describe('Pizza ordering', () => {
	describe('Built-in abilities', () => {
		test('Displays version', () => {
			return runProgram(entryFile, '--version', '--experimental-modules').then(
				({ stdout }) => {
					expect(stdout.includes('pizza-ordering: 1.2.3')).toBe(true);
				}
			);
		});
	});
});
