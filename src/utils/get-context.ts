// Imports
import fs from 'fs';
import path from 'path';
import * as yup from 'yup';
import validatePackageName from 'validate-npm-package-name';

// Define what a fully-constructed context object looks like
export interface Context {
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
	let packageFile: unknown = undefined;
	const packageFilePath = path.join(process.cwd(), 'package.json');

	if (fs.existsSync(packageFilePath)) {
		packageFile = require(packageFilePath);
	}

	// Create context schema
	const schema: yup.SchemaOf<Context> = yup.object({
		packageFile: yup.object({
			name: yup
				.string()
				.test('is-valid-package-name', '`package.json` contains an invalid name', (value) =>
					value === undefined ? true : validatePackageName(value).validForOldPackages
				),
			version: yup.string().label('`package.json` version'),
		}),
	});

	// Validate and store the context
	context = await schema.validate({
		packageFile: packageFile,
	});

	// Return context
	return context;
}
