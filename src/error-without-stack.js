// Custom error class that does not print a stack
module.exports = class ErrorWithoutStack extends Error {
    constructor(...args) {
        super(...args);
		this.stack = this.message;
    }
};
