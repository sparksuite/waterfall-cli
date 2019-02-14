/* eslint-env mocha */
/* eslint no-control-regex: "off" */


// Dependencies
require('colors');
const assert = require('assert');
const { spawn } = require('child_process');


// Set environment variable
process.env.TEST_MODE = 'true';


// Initialize
const entryFile = `${__dirname}/programs/pizza-ordering/cli/entry.js`;


// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}


// Test runner
function runTest(customArguments, stdoutIncludes, stderrIncludes, done) {
	// Initialize
	let stdout = '';
	let stderr = '';
	
	
	// Spawn
	const child = spawn('node', [entryFile, ...customArguments.split(' ')]);
	
	
	// Listeners
	child.on('exit', (code) => {
		// Handle an issue
		if (code !== 0) {
			throw new Error(`Exit code ${code}`);
		}
		
		
		// Loop over includes
		if (typeof stdoutIncludes === 'object') {
			stdoutIncludes.forEach((text) => {
				assert.equal(removeFormatting(stdout).includes(text), true);
			});
		}
		
		if (typeof stderrIncludes === 'object') {
			stderrIncludes.forEach((text) => {
				assert.equal(removeFormatting(stderr).includes(text), true);
			});
		}
		
		
		// Finish
		done();
	});
	
	child.on('error', (error) => {
		throw new Error(error.toString());
	});
	
	child.stdout.on('data', (data) => {
		stdout += data.toString();
	});
	
	child.stderr.on('data', (data) => {
		stderr += data.toString();
	});
}


// Tests
describe('Pizza ordering', () => {
	describe('Built-in abilities', () => {
		it('Displays version', (done) => {
			runTest('--version', [
				'pizza-ordering: 1.2.3',
			], undefined, done);
		});
	});
});
