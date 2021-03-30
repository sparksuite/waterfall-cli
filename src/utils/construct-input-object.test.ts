// Imports
import path from 'path';
import constructInputObject from './construct-input-object';

// Set the absolute path to the test projects directory
const testProjectsPath = path.normalize(path.join(__dirname, '..', '..', 'test-projects'));

// Tests
describe('#constructInputObject()', () => {
	it('Handles combination of input', async () => {
		process.argv = [
			'/path/to/node',
			path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'),
			'list',
			'--delivery-zip-code',
			'55555',
			'--sort',
			'popularity',
			'-q',
			'--vegetarian',
			'toppings',
		];

		expect(await constructInputObject()).toStrictEqual({
			command: 'list',
			data: 'toppings',
			options: {
				deliveryZipCode: '55555',
				limit: undefined,
				maxPrice: undefined,
				sort: 'popularity',
			},
			flags: {
				quiet: true,
				vegetarian: true,
			},
		});
	});

	it('Complains about missing required option', async () => {
		process.argv = [
			'/path/to/node',
			path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'),
			'list',
			'toppings',
		];

		await expect(constructInputObject()).rejects.toThrow('The --sort option is required');
	});

	it('Complains about missing required data', async () => {
		process.argv = [
			'/path/to/node',
			path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'),
			'list',
			'--sort',
			'popularity',
		];

		await expect(constructInputObject()).rejects.toThrow('Data is required');
	});
});
