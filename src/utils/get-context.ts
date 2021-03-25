// Imports
import fs from 'fs';
import { z } from 'zod';
import validatePackageName from 'validate-npm-package-name';
import readPkgUp from 'read-pkg-up';
import standardizeArguments from './standardize-arguments.js';

// Define what a fully-constructed context object looks like
export interface Context {
	/** The entry file being executed by Node.js */
	entryFile: string;

	/** The standardized array of program arguments */
	standardizedArguments: string[];

	/** Details from the app's package file */
	packageFile?: {
		name?: string;
		version?: string;
	};
}

// Initialize
let context: Context | undefined = undefined;

/** Construct the context object */
export default async function getContext(reconstruct?: true): Promise<Context> {
	// Return already constructed version, if possible
	if (typeof context === 'object' && reconstruct !== true) {
		return context;
	}

	// Attempt to get details from the package file
	const packageFile = (
		await readPkgUp({
			cwd: fs.realpathSync(process.argv[1]),
			normalize: false,
		})
	)?.packageJson;

	// Create context schema
	const schema = z
		.object({
			entryFile: z.string(),
			standardizedArguments: z.string().array(),
			packageFile: z
				.object({
					name: z
						.string()
						.nonempty()
						.refine((value) => validatePackageName(value).validForOldPackages, {
							message: '`package.json` contains an invalid name',
						})
						.optional(),
					version: z.string().nonempty().optional(),
				})
				.optional(),
		})
		.strict();

	// Validate and store the context
	context = schema.parse({
		entryFile: fs.realpathSync(process.argv[1]),
		standardizedArguments: standardizeArguments(process.argv),
		packageFile: packageFile,
	});

	// Return context
	return context;
}
