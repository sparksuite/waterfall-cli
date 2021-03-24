// Imports
import path from 'path';
import getContext from './get-context';
import * as z from 'zod';

// Set the absolute path to the test file trees directory
const testFileTreesPath = path.normalize(path.join(__dirname, '..', '..', 'test-file-trees'));

// Tests
describe('#getContext()', () => {
	it('Skips reconstructing the context when possible', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-version', 'entry.js');

		const context1 = await getContext(true);
		const context2 = await getContext();

		expect(Object.is(context2, context1)).toBe(true);
	});

	it('Handles no package file', async () => {
		process.argv[1] = '/tmp';

		expect(await getContext(true)).toStrictEqual({
			packageFile: undefined,
		});
	});

	it('Handles empty package file', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'empty-package', 'entry.js');

		expect(await getContext(true)).toStrictEqual({
			packageFile: {},
		});
	});

	it('Handles package file missing name', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-name', 'entry.js');

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				version: '1.2.3',
			},
		});
	});

	it('Handles package file missing version', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-version', 'entry.js');

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				name: 'test',
			},
		});
	});

	it('Handles package file with custom key', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-custom-key', 'entry.js');

		expect(await getContext(true)).toStrictEqual({
			packageFile: {
				name: 'test',
			},
		});
	});

	it('Catches invalid name', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-invalid-name', 'entry.js');

		await expect(() => getContext(true)).rejects.toThrow(z.ZodError);
		await expect(() => getContext(true)).rejects.toThrow('`package.json` contains an invalid name');
	});

	it('Catches invalid version', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-invalid-version', 'entry.js');

		await expect(() => getContext(true)).rejects.toThrow(z.ZodError);
		await expect(() => getContext(true)).rejects.toThrowError('Expected string, received object');
	});
});
