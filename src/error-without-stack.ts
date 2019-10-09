// Custom error class that does not print a stack
export default class ErrorWithoutStack extends Error {
	constructor(...args: string[]) {
		super(...args);
		this.stack = this.message;
	}
}
