// Imports
import fs from 'fs';
import path from 'path';
import chalk from './chalk.js';
import { PrintableError } from './errors.js';
import { ExcludeMe, OmitExcludeMeProperties } from '../types/exclude-matching-properties.js';
import getContext from './get-context.js';

// Define what command input looks like
export interface CommandInput {
	flags?: {
		[flag: string]: boolean;
	};
	options?: {
		[option: string]: string | string[] | number | number[];
	};
	data?: string | string[] | number | number[];
	acceptsPassThroughArgs?: true;
}

// Helper types
export type EmptyCommandInput = {
	[Key in keyof Required<CommandInput>]: undefined;
};

// Determine whether type is a literal or not
type IsLiteral<T> = T extends Array<infer Item>
	? IsLiteral<Item>
	: string extends T
	? false
	: number extends T
	? false
	: true;

// Hand back array of provided type, whether it was an array or not
type AlwaysArray<T> = NonNullable<T> extends Array<unknown> ? T : NonNullable<T>[];

// Create union of all basic types present in the type
type UnionTypes<T> = T extends Array<infer Item>
	? `arrayOf${UnionTypes<Item>}`
	: T extends string
	? IsLiteral<T> extends true
		? 'strvalue'
		: 'string'
	: T extends number
	? IsLiteral<T> extends true
		? 'numvalue'
		: 'number'
	: T extends boolean
	? 'boolean'
	: T extends Function // eslint-disable-line
	? 'function'
	: 'object';

// Determine whether it's a union or not
type IsUnion<T, U extends T = T> = T extends unknown ? ([U] extends [T] ? false : true) : false;

// Decide whether the type contains multiple base types
type DetectMultipleTypes<T> = IsUnion<UnionTypes<T>>;

// Decide what the accepts type will expand to
type AcceptTypes<T> = IsLiteral<T> extends true
	? AlwaysArray<T>
	: AlwaysArray<T> | (() => AlwaysArray<T> | Promise<AlwaysArray<T>>);

// Get type of array elements
type ArrayItemType<T> = T extends Array<infer Item> ? Item : T;

// Decide whether accepts should be optional or not
type IsAcceptsOptional<T> = IsLiteral<T> extends true ? false : true;

// Decide whether numeric type identifier is needed; decide whether to flag as required; decide whether multiple responses are accepted; decide whether accepts is optional or not, and determine type for accepts
type DataTypeAddons<T, U> = {
	/** What type of numeric data should be provided. Invalid data will be rejected. */
	type: number extends U ? (U extends number ? 'integer' | 'float' : ExcludeMe) : ExcludeMe;

	/** Must be defined as `true` when data must be provided to this command, otherwise must be omitted. */
	required: undefined extends U ? ExcludeMe : true;

	/** Must be defined as `true` when multiple elements are accepted, otherwise must be omitted. */
	acceptsMultiple: T extends Array<unknown> ? true : ExcludeMe;
} & (IsAcceptsOptional<U> extends true
	? {
			/** If provided defines acceptable values otherwise any input will be accepted. */
			accepts?: AcceptTypes<ArrayItemType<T>>;
	  }
	: {
			/** Required array of acceptable values. */
			accepts: AcceptTypes<ArrayItemType<T>>;
	  });

// Generate data type elements only if data type is acceptable
type CommonDataElements<T> = NonNullable<T> extends string | number | string[] | number[]
	? DetectMultipleTypes<NonNullable<T>> extends true
		? never
		: DataTypeAddons<NonNullable<T>, T>
	: never;

/** Describes a command's specifications */
export type CommandSpec<Input extends CommandInput = EmptyCommandInput> = OmitExcludeMeProperties<{
	/** A description of this command, to be shown on help screens. */
	description?: string;

	/** Whether to execute this command before executing commands farther down in the file tree. Defaults to `false`. */
	executeOnCascade?: true;

	/** Whether this command accepts pass-through arguments (arguments that follow ` -- `). Pass-through arguments are intended to be handed off to another program being executed by this command. Defaults to `false`. */
	acceptsPassThroughArgs: undefined extends Input['acceptsPassThroughArgs'] ? ExcludeMe : true;

	/** Permitted boolean arguments. */
	flags: 'flags' extends keyof Input
		? NonNullable<Input['flags']> extends never
			? ExcludeMe
			: {
					[Flag in keyof Input['flags']]: {
						/** A description of this flag, to be shown on help screens. */
						description?: string;

						/** Whether this flag also applies to commands farther down in the file tree. Defaults to `false`. */
						cascades?: true;

						/** A single-character that could be used instead of the full flag name. */
						shorthand?: string;
					};
			  }
		: ExcludeMe;

	/** Permitted key/value arguments. */
	options: 'options' extends keyof Input
		? NonNullable<Input['options']> extends never
			? ExcludeMe
			: {
					[Option in keyof Input['options']]: OmitExcludeMeProperties<
						{
							/** A description of this option, to be shown on help screens. */
							description?: string;

							/** Whether this option also applies to commands farther down in the file tree. Defaults to `false`. */
							cascades?: true;

							/** A single-character that could be used instead of the full option name. */
							shorthand?: string;
						} & CommonDataElements<Input['options'][Option]>
					>;
			  }
		: ExcludeMe;

	/** Details about what kind of data this command accepts. Any object (even an empty one) permits data. */
	data: 'data' extends keyof Input
		? NonNullable<Input['data']> extends never
			? ExcludeMe
			: OmitExcludeMeProperties<
					{
						/** A description of what kind of data should be provided, to be shown on help screens. */
						description?: string;

						/** Whether to ignore anything that looks like flags/options once data is reached. Useful if you expect your data to contain things that would otherwise appear to be flags/options. */
						ignoreFlagsAndOptions?: true;
					} & CommonDataElements<Input['data']>
			  >
		: ExcludeMe;
}>;

// Describes what a command spec might look like after being imported
export interface GenericCommandSpec {
	description?: string;
	executeOnCascade?: true;
	acceptsPassThroughArgs?: true;
	flags?: {
		[flag: string]: {
			description?: string;
			cascades?: true;
			shorthand?: string;
		};
	};
	options?: {
		[option: string]: {
			description?: string;
			cascades?: true;
			shorthand?: string;
			required?: true;
			type?: 'integer' | 'float';
			accepts?: string[] | number[] | (() => string[] | number[]) | (() => Promise<string[] | number[]>);
		};
	};
	data?: {
		description?: string;
		required?: true;
		type?: 'integer' | 'float';
		accepts?: string[] | number[] | (() => string[] | number[]) | (() => Promise<string[] | number[]>);
		ignoreFlagsAndOptions?: true;
	};
}

/** Get the parsed command spec from a particular directory */
export default async function getCommandSpec(directory: string): Promise<GenericCommandSpec> {
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

	// Get the context
	const context = await getContext();

	// Get the file paths
	const specFilePath = specFiles[0];
	const truncatedPath = specFilePath.replace(`${path.dirname(context.entryFile)}/`, '');

	// Return
	try {
		let spec = (await import(specFilePath)) as { default: GenericCommandSpec } | GenericCommandSpec;

		spec = 'default' in spec ? spec.default : spec;

		if (spec.data?.accepts && typeof spec.data.accepts === 'function') {
			const arrayOrPromise = spec.data.accepts();
			spec.data.accepts = arrayOrPromise instanceof Promise ? await arrayOrPromise : arrayOrPromise;
		}

		return spec;
	} catch (error) {
		throw new PrintableError(
			`${String(error)}\n\nEncountered this error while importing the spec file at: ${chalk.bold(truncatedPath)}`
		);
	}
}
