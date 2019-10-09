export interface AppInformation {
	name?: string;
	packageName?: string;
	version?: string;
}

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
}

export interface InputObject {
	command: string;
	data?: string | number;
	[index: string]: boolean | string | number | undefined;
}

export interface OrganizedArguments {
	command: string;
	data?: string | number;
	flags: string[];
	options: string[];
	values: (string | number)[];
}

export interface Settings {
	app: AppInformation;
	arguments: string[];
	mainFilename: string;
	newVersionWarning: {
		enabled: boolean;
		installedGlobally: boolean;
	};
	onStart?: (inputObject: InputObject) => void;
	packageFilePath: string;
	spacing: {
		after: number;
		before: number;
	};
	usageCommand?: string;
	verbose: boolean;
}
