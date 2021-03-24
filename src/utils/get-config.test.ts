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

	it('Handles no custom config', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'primary'));

		expect(await getConfig(undefined, true)).toStrictEqual({
			app: {
				displayName: 'primary',
				packageName: 'primary',
				version: '1.2.3',
			},
		});
	});

	it('Handles custom values', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'primary'));

		expect(
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
		).toStrictEqual({
			app: {
				displayName: 'Custom',
				packageName: 'custom',
				version: '4.5.6',
			},
		});
	});

	it('Handles custom values when there is no package file', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		expect(
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
		).toStrictEqual({
			app: {
				displayName: 'Custom',
				packageName: 'custom',
				version: '4.5.6',
			},
		});
	});

	it('Catches invalid name', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-with-invalid-name'));

		const invalidConfig = {
			app: {
				packageName: '???',
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow('`package.json` contains an invalid name');
	});

	it('Catches invalid version', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-with-invalid-version'));

		const invalidConfig = {
			app: {
				version: false,
			},
		};

		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getConfig(invalidConfig, true)).rejects.toThrow(
			'`package.json` version must be a `string` type'
		);
	});
});
