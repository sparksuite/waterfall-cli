const chalk = require('chalk');

module.exports =
	// Print a pretty error message
	function printPrettyError(message) {
		console.error(`${chalk.inverse.red.bold(' ERROR ')}\n`);
		console.error(chalk.red(`> ${message.split('\n').join('\n> ')}\n`));
	};
