// Dependencies
import standardizeArguments from './standardize-arguments';

// Tests
describe('#standardizeArguments()', () => {
	it('Handles normal arguments', () => {
		expect(
			standardizeArguments([
				'/path/to/node',
				'/path/to/entry.js',
				'command',
				'--option1=value',
				'--option2',
				'value',
				'--flag',
				'-f',
				'data1',
				'data2',
			])
		).toStrictEqual(['command', '--option1', 'value', '--option2', 'value', '--flag', '-f', 'data1', 'data2']);
	});

	it('Handles data with special characters', () => {
		expect(standardizeArguments(['/path/to/node', '/path/to/entry.js', 'command', '~!@#$%^&*()-=_+'])).toStrictEqual([
			'command',
			'~!@#$%^&*()-=_+',
		]);
	});

	it('Handles dangling equals sign', () => {
		expect(standardizeArguments(['/path/to/node', '/path/to/entry.js', 'command', '--option='])).toStrictEqual([
			'command',
			'--option',
		]);
	});
});
