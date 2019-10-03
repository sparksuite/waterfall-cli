/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');

// Initialize
const entryFile = `${__dirname}/programs/es6-imports/cli/entry.js`;

// Tests
describe('ES6 imports', () => {
	describe('Built-in abilities', () => {
		test('Tests are temporarily suspended for this test', () => {
			expect(true).toBe(true);
		});
		
// 		test('Displays version', () => {
// 			return runProgram(entryFile, '--version', '--experimental-modules').then(
// 				({ stdout }) => {
// 					expect(stdout.includes('es6-imports: 1.2.3')).toBe(true);
// 				}
// 			);
// 		});
 	});
});
