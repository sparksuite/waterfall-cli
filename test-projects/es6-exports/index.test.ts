// Imports
import execa from 'execa';
import semver from 'semver';

// Remove ANSI formatting
function removeFormatting(text: string): string {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line no-control-regex
		''
	);
}

// Don't run the normal tests if older than Node.js version 12
if (semver.lt(semver.clean(process.version) ?? '', '13.2.0')) {
	it('Tests disabled on Node.js versions older than v13.2.0', () => {
		expect(true).toBe(true);
	});
} else {
	// Tests
	describe('Built-in abilities', () => {
		it('Displays version', async () => {
			const result = await execa('node', ['./cli/entry.js', '--version'], {
				all: true,
				reject: false,
			});

			result.stdout = removeFormatting(result.stdout);

			expect(result).toMatchObject({
				exitCode: 0,
				stdout: expect.stringContaining('es6-exports: 1.2.3'),
				stderr: '',
			});
		});
	});

	describe('Commands', () => {
		it('Runs a simple command successfully', async () => {
			const result = await execa('node', ['./cli/entry.js', 'example'], {
				all: true,
				reject: false,
			});

			result.stdout = removeFormatting(result.stdout);

			expect(result).toMatchObject({
				exitCode: 0,
				stdout: expect.stringContaining('Ran example command'),
				stderr: '',
			});
		});
	});
}
