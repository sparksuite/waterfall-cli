// Dependencies
const { spawn } = require('child_process');

// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line no-control-regex
		''
	);
}

// Test runner
module.exports = function runProgram(entryFile, customArguments) {
	// Return a promise
	return new Promise(resolve => {
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

			// Resolve and hand back stdout/stderr
			resolve({
				stdout: removeFormatting(stdout),
				stderr: removeFormatting(stderr),
			});
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
	});
};
