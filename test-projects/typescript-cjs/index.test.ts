// Imports
import execa from 'execa';

// Remove ANSI formatting
function removeFormatting(text: string): string {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line no-control-regex
		''
	);
}

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
			stdout: expect.stringContaining('typescript-cjs: 1.2.3'),
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
