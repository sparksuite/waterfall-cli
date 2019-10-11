// Dependencies
const { exec } = require('child_process');

// Remove ANSI formatting
function removeFormatting(text) {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line no-control-regex
		''
	);
}

// Test runner
module.exports = function runProgram(
	entryFile,
	programArguments = '',
	nodeArguments = '',
	preArguments = ''
) {
	// Return a promise
	return new Promise((resolve, reject) => {
		// Build the array of all arguments
		let allArguments = [
			...preArguments.split(' '),
			'node',
			...nodeArguments.split(' '),
			entryFile,
			...programArguments.split(' '),
		];
		allArguments = allArguments.filter(element => element !== '');

		// Launch the program
		exec(allArguments.join(' '), (error, stdout, stderr) => {
			// Handle an issue
			if (error) {
				reject({
					error: error,
					stdout: removeFormatting(stdout),
					stderr: removeFormatting(stderr),
					result: `Program exited with code: ${error.code}. See details:\n\n${error}`,
				});
			}

			// Resolve and hand back stdout/stderr
			resolve({
				stdout: removeFormatting(stdout),
				stderr: removeFormatting(stderr),
			});
		});
	});
};
