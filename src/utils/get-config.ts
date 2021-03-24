// Imports
import * as z from 'zod';
import validatePackageName from 'validate-npm-package-name';
import getContext from './get-context';
import printPrettyError from './print-pretty-error';
import chalk from './chalk';

// Define what a fully-constructed config object looks like
export interface Config {
	/** Information about your CLI app. */
	app?: {
		/** Your app’s display name. Defaults to the `name` in its `package.json` file, if available. */
		displayName?: string;

		/** Your app’s published package name. Defaults to the `name` in its `package.json` file, if available. */
		packageName?: string;

		/** Your app’s version number. Defaults to the `version` in its `package.json` file, if available. */
		version?: string;
	};

	/** Extra whitespace automatically printed around your app’s output for aesthetics. */
	spacing: {
		/** Extra whitespace printed before your app’s output. Defaults to `1`. */
		before: number;

		/** Extra whitespace printed after your app’s output. Defaults to `1`. */
		after: number;
	};
}

// Initialize
let config: Config | undefined = undefined;

/** Construct the config object */
export default async function getConfig(customConfig?: unknown, reconstruct?: true): Promise<Config> {
	// Return already constructed version, if possible
	if (typeof config === 'object' && reconstruct !== true) {
		return config;
	}

	// Get the context
	const context = await getContext(reconstruct);

	// Create config schema
	const schema = z
		.object({
			app: z
				.object({
					displayName: z.string().nonempty().optional().default(context.packageFile?.name),
					packageName: z
						.string()
						.nonempty()
						.refine((value) => validatePackageName(value).validForOldPackages)
						.optional()
						.default(context.packageFile?.name),
					version: z.string().nonempty().optional().default(context.packageFile?.version),
				})
				.strict()
				.default({}),
			spacing: z
				.object({
					before: z.number().int().min(0).default(1),
					after: z.number().int().min(0).default(1),
				})
				.strict()
				.default({}),
		})
		.strict()
		.default({});

	// Validate and store the config
	try {
		config = schema.parse(customConfig);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			let errorMessage = 'Found issues with config:\n';

			for (const suberror of error.errors) {
				errorMessage += `\n${chalk.bold(suberror.path.join('.') || 'root')}: ${suberror.message}`;
			}

			printPrettyError(errorMessage);
		}

		throw error;
	}

	// Return
	return config;
}
