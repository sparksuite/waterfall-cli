// Dependencies
import chalk from 'chalk';

// Print a pretty error message
export default function printPrettyError(message: string) {
	console.error(`${chalk.inverse.red.bold(' ERROR ')}\n`);
	console.error(chalk.red(`> ${message.split('\n').join('\n> ')}\n`));
}
