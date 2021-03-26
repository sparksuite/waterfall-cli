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
		const jestWorkerID = process.env.JEST_WORKER_ID;
		delete process.env.JEST_WORKER_ID;

		const context1 = await getContext();
		const context2 = await getContext();

		expect(Object.is(context2, context1)).toBe(true);

		process.env.JEST_WORKER_ID = jestWorkerID;
	});

	it('Handles entry file', async () => {
		process.argv[1] = process.cwd();

		expect((await getContext()).entryFile).toEqual(process.cwd());
	});

	it('Handles no package file', async () => {
		process.argv[1] = '/tmp';

		expect((await getContext()).packageFile).toEqual(undefined);
	});

	it('Handles empty package file', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'empty-package', 'entry.js');

		expect((await getContext()).packageFile).toStrictEqual({});
	});

	it('Handles package file missing name', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-name', 'entry.js');

		expect((await getContext()).packageFile).toStrictEqual({
			version: '1.2.3',
		});
	});

	it('Handles package file missing version', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-missing-version', 'entry.js');

		expect((await getContext()).packageFile).toStrictEqual({
			name: 'test',
		});
	});

	it('Handles package file with custom key', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-custom-key', 'entry.js');

		expect((await getContext()).packageFile).toStrictEqual({
			name: 'test',
		});
	});

	it('Catches invalid name', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-invalid-name', 'entry.js');

		await expect(() => getContext()).rejects.toThrow(z.ZodError);
		await expect(() => getContext()).rejects.toThrow('`package.json` contains an invalid name');
	});

	it('Catches invalid version', async () => {
		process.argv[1] = path.join(testFileTreesPath, 'package-with-invalid-version', 'entry.js');

		await expect(() => getContext()).rejects.toThrow(z.ZodError);
		await expect(() => getContext()).rejects.toThrowError('Expected string, received object');
	});
});
