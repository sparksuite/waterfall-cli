// Imports
import * as z from 'zod';
import validatePackageName from 'validate-npm-package-name';
import getContext from './get-context.js';
import printPrettyError from './print-pretty-error.js';
import chalk from './chalk.js';
import path from 'path';
import { InputObject } from './construct-input-object.js';
import { CommandInput, EmptyCommandInput } from '../utils/get-command-spec.js';

// Define what a fully-constructed config object looks like
export interface Config<Input extends CommandInput = EmptyCommandInput> {
	/** Your program’s display name. Defaults to the `name` in its `package.json` file, if available. */
	displayName?: string;

	/** Your program’s published package name. Defaults to the `name` in its `package.json` file, if available. */
	packageName?: string;

	/** Your program’s version number. Defaults to the `version` in its `package.json` file, if available. */
	version?: string;

	/** The command users should use to run your program. Defaults to the `node [entry filename]`. */
	usageCommand: string;

	/** An optional function to call when the program is first executed. */
	onStart?: (inputObject: InputObject<Input>) => Promise<void>;

	/** Extra whitespace automatically printed around your program’s output for aesthetics. */
	spacing: {
		/** Extra whitespace printed before your program’s output. Defaults to `1`. */
		before: number;

		/** Extra whitespace printed after your program’s output. Defaults to `1`. */
		after: number;
	};

	/** Whether to print verbose debugging information. Defaults to `false`. */
	verbose: boolean;
}

// Initialize
let config: Config | undefined = undefined;

/** Construct the config object */
export default async function getConfig(customConfig?: unknown): Promise<Config> {
	// Return already constructed version, if possible
	if (typeof config === 'object' && !process.env.JEST_WORKER_ID) {
		return config;
	}

	// Get the context
	const context = await getContext();

	// Create config schema
	const schema = z
		.object({
			displayName: z.string().nonempty().optional().default(context.packageFile?.name),
			packageName: z
				.string()
				.nonempty()
				.refine((value) => validatePackageName(value).validForOldPackages)
				.optional()
				.default(context.packageFile?.name),
			version: z.string().nonempty().optional().default(context.packageFile?.version),
			usageCommand: z
				.string()
				.nonempty()
				.default(`node ${path.basename(context.entryFile)}`),
			onStart: z.function(z.tuple([z.any()]), z.promise(z.void())).optional(),
			spacing: z
				.object({
					before: z.number().int().min(0).default(1),
					after: z.number().int().min(0).default(1),
				})
				.strict()
				.default({}),
			verbose: z.boolean().default(false),
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
				let prefix = '';
				const pathToKey = suberror.path.join('.');

				if (pathToKey) {
					prefix = `${chalk.bold(suberror.path.join('.'))}: `;
				}

				errorMessage += `${prefix}${suberror.message}`;
			}

			printPrettyError(errorMessage);
		}

		throw error;
	}

	// Return
	return config;
}
