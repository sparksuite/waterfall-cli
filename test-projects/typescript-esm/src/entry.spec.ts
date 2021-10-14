// Import type
import { CommandSpec } from 'waterfall-cli';

// Define and export shape of input
export interface Input {
	flags: {
		['verbose']: boolean;
	};
}

// Define and export spec
const spec: CommandSpec<Input> = {
	flags: {
		verbose: {
			cascades: true,
			description: 'Output additional details if enabled',
			shorthand: 'v',
		},
	},
};
export default spec;
