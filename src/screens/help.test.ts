// Imports
import path from 'path';
import chalk from '../utils/chalk';
import helpScreen from './help';

// Remove ANSI formatting
function removeFormatting(text: string) {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

// Set the absolute path to the test projects directory
const testProjectsPath = path.normalize(path.join(__dirname, '..', '..', 'test-projects'));

// Tests
describe('#helpScreen()', () => {
	it('Contains description line', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(await helpScreen(true)).toContain(`${chalk.bold('Description:')} List something`);
	});

	it('Contains usage line (commands + flags + options)', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'Usage: node entry.js [commands] [flags] [options]'
		);
	});

	it('Contains usage line (flags + options + data)', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'Usage: node entry.js list [flags] [options] [data]'
		);
	});

	it('Contains flags header', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('FLAGS:');
	});

	it('Shows or does not show non-cascading flags when appropriate', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('--non-cascading');

		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).not.toContain('--non-cascading');
	});

	it('Contains cascading flags', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('--quiet');

		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain('--quiet');
	});

	it('Mentions shorthand variant of flag', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('--quiet, -q');
	});

	it('Contains description of  flag', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'Disable interactivity, rely on default values instead'
		);
	});

	it('Contains options header', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('OPTIONS:');
	});

	it('Contains cascading options', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('--delivery-zip-code');

		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain('--delivery-zip-code');
	});

	it('Mentions shorthand variant of option', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('--delivery-zip-code, -z');
	});

	it('Contains description of option', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('The delivery ZIP code, for context');
	});

	it('Contains description of option with type', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'The maximum price of the items to list (float)'
		);
	});

	it('Contains description of required option with accepts', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'How to sort the list (required) (accepts: popularity, alphabetical)'
		);
	});

	it('Contains commands header', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('COMMANDS:');

		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).not.toContain('COMMANDS:');
	});

	it('Contains description of command', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).toContain('Order a pizza');
	});

	it('Contains data header', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain('DATA:');

		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js')];

		expect(removeFormatting(await helpScreen(true))).not.toContain('DATA:');
	});

	it('Contains description of data', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'order', 'dine-in'];

		expect(removeFormatting(await helpScreen(true))).toContain('What type of pizza to order');
	});

	it('Falls back to default data description', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'order', 'descriptionless-data'];

		expect(removeFormatting(await helpScreen(true))).toContain('DATA:');

		expect(removeFormatting(await helpScreen(true))).toContain('This command allows data to be passed in');
	});

	it('Contains description of require data with accepts', async () => {
		process.argv = ['/path/to/node', path.join(testProjectsPath, 'pizza-ordering', 'cli', 'entry.js'), 'list'];

		expect(removeFormatting(await helpScreen(true))).toContain(
			'What you want to list (required) (accepts: toppings, crusts, two words)'
		);
	});
});