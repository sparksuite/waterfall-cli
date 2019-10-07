// Dependencies
const chalk = require('chalk');

// Print a pretty error message
module.exports = function printPrettyError(message) {
	console.error(`${chalk.inverse.red.bold(' ERROR ')}\n`);
	console.error(chalk.red(`> ${message.split('\n').join('\n> ')}\n`));
};
