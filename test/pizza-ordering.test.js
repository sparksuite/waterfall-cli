/* eslint-env jest */
/* eslint no-control-regex: "off" */

// Dependencies
const { spawn } = require('child_process');

// Initialize
const entryFile = `${__dirname}/programs/pizza-ordering/cli/entry.js`;

// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		''
	);
}

// Test runner
function runTest(customArguments, stdoutIncludes, stderrIncludes, done) {
	// Initialize
	let stdout = '';
	let stderr = '';

	// Form spawn array
	let spawnArray = [entryFile, ...customArguments.split(' ')];
	spawnArray = spawnArray.filter(element => element !== '');

	// Spawn
	const child = spawn('node', spawnArray);

	// Listeners
	child.on('exit', code => {
		// Handle an issue
		if (code !== 0) {
			throw new Error(`Exit code ${code}`);
		}

		// Loop over includes
		if (typeof stdoutIncludes === 'object') {
			stdoutIncludes.forEach(text => {
				expect(removeFormatting(stdout).includes(text)).toBe(true);
			});
		}

		if (typeof stderrIncludes === 'object') {
			stderrIncludes.forEach(text => {
				expect(removeFormatting(stderr).includes(text)).toBe(true);
			});
		}

		// Finish
		done();
	});

	child.on('error', error => {
		throw new Error(error.toString());
	});

	child.stdout.on('data', data => {
		stdout += data.toString();
	});

	child.stderr.on('data', data => {
		stderr += data.toString();
	});
}

// Tests
describe('Pizza ordering', () => {
	describe('Built-in abilities', () => {
		test('Displays version', done => {
			runTest('--version', ['pizza-ordering: 1.2.3'], undefined, done);
		});

		test('Displays version for a command', done => {
			runTest('list --version', ['pizza-ordering: 1.2.3'], undefined, done);
		});

		test('Displays help screen', done => {
			runTest('--help', ['Usage: node entry.js [commands]'], undefined, done);
		});

		test('Displays help screen for a command', done => {
			runTest(
				'list --help',
				['Usage: node entry.js list [flags]'],
				undefined,
				done
			);
		});

		it('Displays help screen when no arguments', done => {
			runTest('', ['Usage: node entry.js [commands]'], undefined, done);
		});
	});
});
