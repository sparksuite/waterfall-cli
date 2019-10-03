/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');
const semver = require('semver');

// Initialize
const entryFile = `${__dirname}/programs/es6-imports/cli/entry.js`;

// Don't run the normal tests if older than Node.js version 12
if (semver.lt(semver.clean(process.version), '12.0.0')) {
	test('Tests disabled on Node.js versions older than v12', () => {
		expect(true).toBe(true);
	});
	
	process.exit();
}

// Tests
describe('ES6 imports', () => {
	describe('Built-in abilities', () => {
		test('Displays version', () => {
			return runProgram(entryFile, '--version', '--experimental-modules').then(
				({ stdout }) => {
					expect(stdout.includes('es6-imports: 1.2.3')).toBe(true);
				}
			);
		});
	});
});
