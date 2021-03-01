/* eslint-env jest */

// Dependencies
import processArguments from '../src/process-arguments';

// Tests
describe('#processArguments()', () => {
	test('Handles normal arguments', () => {
		expect(
			processArguments([
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

	test('Handles data with special characters', () => {
		expect(processArguments(['/path/to/node', '/path/to/entry.js', 'command', '~!@#$%^&*()-=_+'])).toStrictEqual([
			'command',
			'~!@#$%^&*()-=_+',
		]);
	});

	test('Handles dangling equals sign', () => {
		expect(processArguments(['/path/to/node', '/path/to/entry.js', 'command', '--option='])).toStrictEqual([
			'command',
			'--option',
		]);
	});
});
