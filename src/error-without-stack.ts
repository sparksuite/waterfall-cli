// Export
export default class ErrorWithoutStack extends Error {
	constructor(...args: string[]) {
		super(...args);
		this.stack = this.message;
	}
}
