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
			stdout: expect.stringContaining('pizza-ordering: 1.2.3'),
			stderr: '',
		});
	});

	it('Displays version for a command', async () => {
		const result = await execa('node', ['./cli/entry.js', 'list', '--version'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('pizza-ordering: 1.2.3'),
			stderr: '',
		});
	});

	it('Displays help screen', async () => {
		const result = await execa('node', ['./cli/entry.js', '--help'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('Usage: node entry.js [commands]'),
			stderr: '',
		});
	});

	it('Displays help screen for a command', async () => {
		const result = await execa('node', ['./cli/entry.js', 'list', '--help'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('Usage: node entry.js list [flags]'),
			stderr: '',
		});
	});

	it('Displays help screen when no arguments', async () => {
		const result = await execa('node', ['./cli/entry.js'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('Usage: node entry.js [commands]'),
			stderr: '',
		});
	});
});

describe('Commands', () => {
	it('Runs a simple command successfully', async () => {
		const result = await execa('node', ['./cli/entry.js', 'order', 'dine-in'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('Ordered for dining in'),
			stderr: '',
		});
	});
});

describe('Init settings', () => {
	it('Calls the `onStart` function', async () => {
		const result = await execa('node', ['./cli/entry.js', 'order', 'dine-in'], {
			all: true,
			reject: false,
		});

		result.stdout = removeFormatting(result.stdout);

		expect(result).toMatchObject({
			exitCode: 0,
			stdout: expect.stringContaining('This is the onStart function'),
			stderr: '',
		});
	});
});
