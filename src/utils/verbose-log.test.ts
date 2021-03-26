// Dependencies
import verboseLog from './verbose-log';
import getConfig, { Config } from '../utils/get-config';
import chalk from './chalk';

// Mocks
console.log = jest.fn();
jest.mock('../utils/get-config');

// Config details that need to be provided, but don't impact testing
const unimportantConfigDetails = {
	usageCommand: 'node entry.js',
	spacing: {
		before: 1,
		after: 1,
	},
};

// Tests
describe('#verboseLog()', () => {
	it('Prints message when verbose is enabled', async () => {
		const config: Config = {
			verbose: true,
			...unimportantConfigDetails,
		};

		// @ts-expect-error: mockImplementation() *is* available
		getConfig.mockImplementation(() => Promise.resolve(config)); // eslint-disable-line @typescript-eslint/no-unsafe-call

		await verboseLog('Example log message');

		expect(console.log).toHaveBeenCalledTimes(1);
		expect(console.log).toHaveBeenCalledWith(chalk.dim.italic(`[VERBOSE] Example log message`));
	});

	it('Does not print message when verbose is disabled', async () => {
		const config: Config = {
			verbose: false,
			...unimportantConfigDetails,
		};

		// @ts-expect-error: mockImplementation() *is* available
		getConfig.mockImplementation(() => Promise.resolve(config)); // eslint-disable-line @typescript-eslint/no-unsafe-call

		await verboseLog('Example log message');

		expect(console.log).toHaveBeenCalledTimes(0);
	});
});
