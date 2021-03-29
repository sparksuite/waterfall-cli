// Imports
import path from 'path';
import getCommandSpec, { AnyCommandInput, CommandSpec } from './get-command-spec.js';
import getContext from './get-context.js';

// Define what a merged spec looks like
type MergedSpec = Partial<CommandSpec<AnyCommandInput>>;

/** Retrieve the merged specifications for a command, taking into consideration parent specs */
export default async function getMergedSpec(command: string): Promise<MergedSpec> {
	// Break into pieces, with entry point
	const pieces = `. ${command}`.trim().split(' ');

	// Initialize
	const mergedSpec: MergedSpec = {
		flags: {
			version: {
				shorthand: 'v',
				description: 'Show version',
			},
			help: {
				shorthand: 'h',
				description: 'Show help',
			},
		},
		options: {},
	};

	// Get the context
	const context = await getContext();

	// Loop over every piece
	let currentPathPrefix = path.dirname(context.entryFile);

	for (const [index, piece] of pieces.entries()) {
		// Append to path prefix
		if (piece) {
			currentPathPrefix += `/${piece}`;
		}

		// Get the command spec
		const spec = await getCommandSpec(currentPathPrefix);

		// Build onto spec
		if (typeof spec.flags === 'object') {
			Object.entries(spec.flags).forEach(([flag, details]) => {
				if (index === pieces.length - 1 || details.cascades === true) {
					if (mergedSpec.flags === undefined) {
						throw new Error('This should not be possible');
					}

					mergedSpec.flags[flag] = details;
				}
			});
		}

		if (typeof spec.options === 'object') {
			Object.entries(spec.options).forEach(([option, details]) => {
				if (index === pieces.length - 1 || details.cascades === true) {
					if (mergedSpec.options === undefined) {
						throw new Error('This should not be possible');
					}

					mergedSpec.options[option] = details;
				}
			});
		}

		if (spec.acceptsPassThroughArgs) {
			mergedSpec.acceptsPassThroughArgs = true;
		}

		if (index === pieces.length - 1) {
			mergedSpec.description = spec.description;
			mergedSpec.data = spec.data;
		}
	}

	// Return spec
	return mergedSpec;
}
