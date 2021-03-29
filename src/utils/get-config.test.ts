// Imports
import path from 'path';
import getConfig, { Config } from './get-config';
import * as z from 'zod';
import printPrettyError from './print-pretty-error';
import chalk from './chalk';

// Mock the error printing function
jest.mock('./print-pretty-error');

// Set the absolute path to the test file trees directory
const testFileTreesPath = path.normalize(path.join(__dirname, '..', '..', 'test-file-trees'));

// Tests
describe('#getConfig()', () => {
	it('Skips reconstructing the config when possible', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-version', 'entry.js');
		const jestWorkerID = process.env.JEST_WORKER_ID;
		delete process.env.JEST_WORKER_ID;

		const config1 = await getConfig();
		const config2 = await getConfig();

		expect(Object.is(config2, config1)).toBe(true);

		process.env.JEST_WORKER_ID = jestWorkerID;
	});

	it('Defaults to expected default values when no custom config', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		expect(await getConfig()).toStrictEqual({
			displayName: 'primary',
			packageName: 'primary',
			version: '1.2.3',
			usageCommand: 'node entry.js',
			spacing: {
				before: 1,
				after: 1,
			},
			verbose: false,
		});
	});

	it('Handles overriding defaults with custom values', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		expect(
			await getConfig({
				displayName: 'Custom',
				packageName: 'custom',
				version: '4.5.6',
				usageCommand: 'custom-executable',
				onStart: async () => {
					// Do nothing
				},
				spacing: {
					before: 0,
					after: 0,
				},
				verbose: true,
			})
		).toStrictEqual({
			displayName: 'Custom',
			packageName: 'custom',
			version: '4.5.6',
			usageCommand: 'custom-executable',
			onStart: expect.any(Function), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
			spacing: {
				before: 0,
				after: 0,
			},
			verbose: true,
		});
	});

	it('Handles some custom values when there is no package file', async () => {
		process.argv[1] = '/tmp';

		expect(
			await getConfig({
				displayName: 'Custom',
				packageName: 'custom',
				version: '4.5.6',
			})
		).toMatchObject({
			displayName: 'Custom',
			packageName: 'custom',
			version: '4.5.6',
		});
	});

	it('Catches invalid name', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		const invalidConfig = {
			packageName: '???',
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('packageName')}: Invalid value`)
		);
	});

	it('Catches invalid version', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		const invalidConfig = {
			version: {
				fake: true,
			},
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('version')}: Expected string, received object`)
		);
	});

	it('Catches invalid usage command', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		const invalidConfig = {
			usageCommand: false,
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('usageCommand')}: Expected string, received boolean`)
		);
	});

	it('Catches invalid spacing', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		const invalidConfig = {
			spacing: {
				before: false,
			},
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('spacing.before')}: Expected number, received boolean`)
		);
	});

	it('Catches unknown keys', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'primary', 'entry.js');

		let invalidConfig: Partial<Config> = {
			// @ts-expect-error: We're forcing an error here
			fake: true,
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(expect.stringContaining(`Unrecognized key(s) in object: 'fake'`));

		invalidConfig = {
			spacing: {
				// @ts-expect-error: We're forcing an error here
				fake: true,
			},
		};

		await expect(() => getConfig(invalidConfig)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('spacing')}: Unrecognized key(s) in object: 'fake'`)
		);
	});
});
