// Imports
import fs from 'fs';
import path from 'path';
import chalk from './chalk.js';
import { PrintableError } from './errors.js';

// Define what a command spec looks like
// TODO: Document with /** comments */
export interface CommandSpec {
	data?: {
		accepts?: string[];
		description?: string;
		ignoreFlagsAndOptions?: true;
		required?: true;
		type?: 'integer' | 'float';
	};
	description?: string;
	flags?: {
		[index: string]: {
			cascades?: true;
			description?: string;
			shorthand?: string;
		};
	};
	options?: {
		[index: string]: {
			accepts?: string[];
			cascades?: true;
			description?: string;
			required?: true;
			shorthand?: string;
			type?: 'integer' | 'float';
		};
	};
	executeOnCascade?: true;
	passThrough?: true;
}

/** Get the parsed command spec from a particular directory */
export default async function getCommandSpec(directory: string): Promise<CommandSpec> {
	// Error if directory does not exist
	if (!fs.existsSync(directory)) {
		throw new Error(`Directory does not exist: ${directory}`);
	}

	// Get child files of a parent directory
	const getFiles = (directory: string): string[] => {
		if (!fs.existsSync(directory)) {
			return [];
		}

		const allItems = fs.readdirSync(directory).map((name: string) => path.join(directory, name));

		return allItems.filter((path) => fs.lstatSync(path).isFile());
	};

	// List the possible spec files in this directory
	const specFiles = getFiles(directory).filter((path) => path.match(/\.spec.[cm]?js$/));

	// Error if not exactly one spec file
	if (specFiles.length !== 1) {
		throw new PrintableError(
			`There should be exactly one spec file (ending in ${chalk.bold('.spec.[cm]?js')}) in: ${directory}`
		);
	}

	// Get the file path
	const specFilePath = specFiles[0];

	// Return
	try {
		const spec = (await import(specFilePath)) as { default: CommandSpec } | CommandSpec;
		return 'default' in spec ? spec.default : spec;
	} catch (error) {
		throw new PrintableError(
			`This spec file contains invalid JS: ${specFilePath}\n${chalk.bold('JS Error: ')}${String(error)}`
		);
	}
}
