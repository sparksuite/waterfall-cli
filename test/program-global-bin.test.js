/* eslint-env jest */

// Dependencies
const runProgram = require('./run-program');
const path = require('path');
const { exec } = require('child_process');

// Link this program
beforeAll(() => {
	return new Promise((resolve, reject) => {
		const programPath = path.join(__dirname, 'programs', 'global-bin');

		exec(`cd ${programPath} && npm link`, error => {
			if (error) {
				reject();
				return;
			}

			resolve();
		});
	});
});

// Tests
describe('Built-in abilities', () => {
	test('Displays version', () => {
		return runProgram('global-bin --version').then(({ stdout }) => {
			expect(stdout).toContain('global-bin: 1.2.3');
		});
	});
});

// Uninstall this program
afterAll(() => {
	return new Promise((resolve, reject) => {
		exec(`npm uninstall --global global-bin`, error => {
			if (error) {
				reject();
				return;
			}

			resolve();
		});
	});
});
