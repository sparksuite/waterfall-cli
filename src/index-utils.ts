import utils from './utils';

// The function used to kick off commands
export function command() {
	return JSON.parse(process.argv[2]);
}

// A helper function provided to commands to keep error messages consistent
export function error(message: string) {
	utils({}).printPrettyError(message);
	process.exit(255);
}
