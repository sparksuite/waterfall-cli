/* eslint-env jest */

// Dependencies
import runProgram from './run-program';
import semver from 'semver';

// Initialize
const entryFile = `${__dirname}/programs/es6-exports/cli/entry.js`;

// Don't run the normal tests if older than Node.js version 12
if (semver.lt(semver.clean(process.version) ?? '', '13.2.0')) {
	test('Tests disabled on Node.js versions older than v13.2.0', () => {
		expect(true).toBe(true);
	});
} else {
	// Tests
	describe('Built-in abilities', () => {
		test('Displays version', () => {
			return runProgram(`node ${entryFile} --version`).then(({ stdout }) => {
				expect(stdout).toContain('es6-exports: 1.2.3');
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
}
