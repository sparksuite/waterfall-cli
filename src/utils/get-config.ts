// Imports
import * as yup from 'yup';
import validatePackageName from 'validate-npm-package-name';
import getContext from './get-context';

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
	spacing?: {
		/** Extra whitespace printed before your app’s output. Defaults to `1`. */
		before?: number;

		/** Extra whitespace printed after your app’s output. Defaults to `1`. */
		after?: number;
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
	const schema: yup.SchemaOf<Config> = yup.object({
		app: yup.object({
			displayName: yup.string().default(context.packageFile?.name || undefined),
			packageName: yup
				.string()
				.test(
					'is-valid-package-name',
					'${path} is not valid',
					(value) => value === undefined ? true : validatePackageName(value ?? '???').validForOldPackages
				)
				.default(context.packageFile?.name || undefined),
			version: yup.string().default(context.packageFile?.version || undefined),
		}).strict().noUnknown(),
		spacing: yup.object({
			before: yup.number().integer().min(0).default(1),
			after: yup.number().integer().min(0).default(1),
		}).strict().noUnknown(),
	}).strict().noUnknown().label('config');

	// Validate and store the config
	config = await schema.validate(customConfig);
	console.log(schema.getDefault());
	console.log(schema.getDefaultFromShape());

	// Return
	return config;
}
