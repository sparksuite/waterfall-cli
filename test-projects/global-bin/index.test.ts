// Imports
import execa from 'execa';

// Remove ANSI formatting
function removeFormatting(text: string): string {
	return text.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line no-control-regex
		''
	);
}

// Globally link and unlink this program
beforeAll(async () => {
	await execa('yarn', ['link']);
});

afterAll(async () => {
	await execa('yarn', ['unlink']);
});

// Tests
describe('Built-in abilities', () => {
	it('Displays version', async () => {
		const result = await execa('global-bin', ['--version'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('global-bin: 1.2.3'),
			stderr: '',
		});
	});
});
