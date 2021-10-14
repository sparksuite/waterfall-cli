// Import and initialize Waterfall CLI
import waterfall from 'waterfall-cli';
import { Input } from './entry.spec';

await waterfall.init<Input>({
	verbose: true,

	onStart: async (input) => {
		console.log(`Input object: ${JSON.stringify(input)}`);

		if (input.flags.verbose) {
			console.log('verbose is enabled!');
		}
	},
});
