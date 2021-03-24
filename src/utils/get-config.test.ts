// Imports
import path from 'path';
import getConfig from './get-config';
import * as yup from 'yup';

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
			(await getConfig(
				{
					app: {
						displayName: 'Custom',
						packageName: 'custom',
						version: '4.5.6',
					},
				},
				true
			)).app
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

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow('app.packageName is not valid');
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

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(
			'app.version must be a `string` type'
		);
	});

	it('Catches invalid spacing', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		const invalidConfig = {
			spacing: {
				before: false,
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(
			'spacing.before must be a `number` type'
		);
	});

	it('Catches unknown keys', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		let invalidConfig: any = {
			fake: true,
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(
			'config field has unspecified keys: fake'
		);

		invalidConfig = {
			spacing: {
				fake: true,
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(
			'spacing field has unspecified keys: fake'
		);
	});
});
