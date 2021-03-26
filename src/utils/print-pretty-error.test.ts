// Dependencies
import printPrettyError from './print-pretty-error';

// Mocks
console.error = jest.fn();

// Tests
describe('#printPrettyError()', () => {
	it('Has the "ERROR" title', () => {
		printPrettyError('Error message content');

		expect(console.error).toHaveBeenCalledTimes(2);
		expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/ ERROR /));
	});

	it('Displays the message text', () => {
		printPrettyError('Error message content');

		expect(console.error).toHaveBeenCalledTimes(2);
		expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/Error message content/));
	});

	it('Returns the message text', () => {
		expect(printPrettyError('Error message content')).toEqual('Error message content');
	});
});
