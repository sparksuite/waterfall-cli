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
module.exports = function runProgram(command) {
	// Return a promise
	return new Promise((resolve, reject) => {
		// Launch the program
		exec(command, (error, stdout, stderr) => {
			// Handle an issue
			if (error) {
				reject({
					error: error,
					stdout: removeFormatting(stdout),
					stderr: removeFormatting(stderr),
				});

				return;
			}

			// Resolve and hand back stdout/stderr
			resolve({
				stdout: removeFormatting(stdout),
				stderr: removeFormatting(stderr),
			});
		});
	});
};
