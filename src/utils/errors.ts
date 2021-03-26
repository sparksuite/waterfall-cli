/** This error indicates it was expected, and a pretty error message should be printed */
export class PrintableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PrintableError';
	}
}
