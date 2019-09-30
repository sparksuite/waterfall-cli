export {};

// Custom error class that does not print a stack
module.exports = class ErrorWithoutStack extends Error {
	constructor(...args: string[]) {
		super(...args);
		this.stack = this.message;
	}
};
