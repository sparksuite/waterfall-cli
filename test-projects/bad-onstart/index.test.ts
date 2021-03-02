// Imports
import execa from 'execa';

// Tests
describe('Settings', () => {
	it('Crashes with invalid `onStart` function', async () => {
		const result = await execa('node', ['./cli/entry.js', 'example'], {
			all: true,
			reject: false,
		});

		expect(result).toMatchObject({
			exitCode: 1,
			all: expect.stringContaining('settings.onStart is not a function'),
		});
	});
});
