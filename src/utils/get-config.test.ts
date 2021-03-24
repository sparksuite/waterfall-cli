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
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-missing-version'));

		const config1 = await getConfig(undefined, true);
		const config2 = await getConfig();

		expect(Object.is(config2, config1)).toBe(true);
	});

	it('Defaults to expected default values when no custom config', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'primary'));

		expect(await getConfig(undefined, true)).toStrictEqual({
			app: {
				displayName: 'primary',
				packageName: 'primary',
				version: '1.2.3',
			},
			spacing: {
				before: 1,
				after: 1,
			},
		});
	});

	it('Handles overriding defaults with custom values', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'primary'));

		expect(
			await getConfig(
				{
					app: {
						displayName: 'Custom',
						packageName: 'custom',
						version: '4.5.6',
					},
					spacing: {
						before: 0,
						after: 0,
					},
				},
				true
			)
		).toStrictEqual({
			app: {
				displayName: 'Custom',
				packageName: 'custom',
				version: '4.5.6',
			},
			spacing: {
				before: 0,
				after: 0,
			},
		});
	});

	it('Handles some custom values when there is no package file', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		expect(
			(
				await getConfig(
					{
						app: {
							displayName: 'Custom',
							packageName: 'custom',
							version: '4.5.6',
						},
					},
					true
				)
			).app
		).toStrictEqual({
			displayName: 'Custom',
			packageName: 'custom',
			version: '4.5.6',
		});
	});

	it('Catches invalid name', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		const invalidConfig = {
			app: {
				packageName: '???',
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('app.packageName')}: Invalid value`)
		);
	});

	it('Catches invalid version', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		const invalidConfig = {
			app: {
				version: {
					fake: true,
				},
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('app.version')}: Expected string, received object`)
		);
	});

	it('Catches invalid spacing', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		const invalidConfig = {
			spacing: {
				before: false,
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('spacing.before')}: Expected number, received boolean`)
		);
	});

	it('Catches unknown keys', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		let invalidConfig: Partial<Config> = {
			// @ts-expect-error: We're forcing an error here
			fake: true,
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('root')}: Unrecognized key(s) in object: 'fake'`)
		);

		invalidConfig = {
			spacing: {
				// @ts-expect-error: We're forcing an error here
				fake: true,
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(z.ZodError);
		expect(printPrettyError).toHaveBeenLastCalledWith(
			expect.stringContaining(`${chalk.bold('spacing')}: Unrecognized key(s) in object: 'fake'`)
		);
	});
});
