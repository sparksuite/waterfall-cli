// Process arguments
export default function processArguments(argv: string[]) {
	const processedArguments: string[] = [];

	argv.forEach(argument => {
		if (argument.substr(0, 2) === '--') {
			argument.split('=').forEach(piece => {
				if (piece !== '') {
					processedArguments.push(piece);
				}
			});
		} else {
			processedArguments.push(argument);
		}
	});

	return processedArguments.slice(2);
}
