// Imports
import fs from 'fs';
import path from 'path';
import chalk from './chalk.js';
import { PrintableError } from './errors.js';

// Define what a command spec looks like
export interface CommandSpec {
	/** A description of this command, to be shown on help screens. */
	description?: string;

	/** Whether to execute this command before executing commands farther down in the file tree. */
	executeOnCascade?: true;

	/** Whether this command accepts pass-through arguments (arguments that follow ` -- `). Pass-through arguments are intended to be handed off to another program being executed by this command. */
	acceptsPassThroughArgs?: true;

	/** Permitted boolean arguments. */
	flags?: {
		[flag: string]: {
			/** A description of this flag, to be shown on help screens. */
			description?: string;

			/** Whether this flag also applies to commands farther down in the file tree. */
			cascades?: true;

			/** A single-character that could be used instead of the full flag name. */
			shorthand?: string;
		};
	};

	/** Permitted key/value arguments. */
	options?: {
		[option: string]: {
			/** A description of this option, to be shown on help screens. */
			description?: string;

			/** Whether this option also applies to commands farther down in the file tree. */
			cascades?: true;

			/** A single-character that could be used instead of the full option name. */
			shorthand?: string;

			/** Whether this option must be provided with this command. */
			required?: true;

			/** What type of value should be provided. Invalid values will be rejected. */
			type?: 'integer' | 'float';

			/** A finite array of acceptable value strings. Invalid values will be rejected. */
			accepts?: string[];
		};
	};

	/** Details about what kind of data this command accepts. Any object (even an empty one) permits data. The keys inside this object provide details about the data. */
	data?: {
		/** A description of what kind of data should be provided, to be shown on help screens. */
		description?: string;

		/** Whether data must be provided to this command. */
		required?: true;

		/** What type of data should be provided. Invalid data will be rejected. */
		type?: 'integer' | 'float';

		/** A finite array of acceptable data strings. Invalid data will be rejected. */
		accepts?: string[];

		/** Whether to ignore anything that looks like flags/options once data is reached. Useful if you expect your data to contain things that would otherwise appear to be flags/options. */
		ignoreFlagsAndOptions?: true;
	};
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
