// Imports
import path from 'path';
import getContext from './get-context';
import * as yup from 'yup';

// Set the absolute path to the test file trees directory
const testFileTreesPath = path.normalize(path.join(__dirname, '..', '..', 'test-file-trees'));

// Tests
describe('#getContext()', () => {
	it('Skips reconstructing the context when possible', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-missing-version'));

		const context1 = await getContext(true);
		const context2 = await getContext();

		expect(Object.is(context2, context1)).toBe(true);
	});

	it('Handles no package file', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'no-package'));

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				name: undefined,
				version: undefined,
			},
		});
	});

	it('Handles empty package file', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'empty-package'));

		expect(await getContext(true)).toStrictEqual({
			packageFile: {},
		});
	});

	it('Handles package file missing name', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-missing-name'));

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				version: '1.2.3',
			},
		});
	});

	it('Handles package file missing version', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-missing-version'));

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				name: 'test',
			},
		});
	});

	it('Catches invalid name', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-with-invalid-name'));

		await expect(() => getContext(true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getContext(true)).rejects.toThrow('`package.json` contains an invalid name');
	});

	it('Catches invalid version', async () => {
		jest.spyOn(process, 'cwd').mockReturnValue(path.join(testFileTreesPath, 'package-with-invalid-version'));

		await expect(() => getContext(true)).rejects.toThrow(yup.ValidationError);
		await expect(() => getContext(true)).rejects.toThrow('`package.json` version must be a `string` type');
	});
});
