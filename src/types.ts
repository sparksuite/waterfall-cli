// Interface declarations

export interface AppSettings {
	name?: string;
	packageName?: string;
	version?: string;
}

export interface CommandSpec {
	data?: {
		accepts?: string[];
		description: string;
		ignoreFlagsAndOptions?: boolean;
		required?: boolean;
		type?: 'integer' | 'float';
	};
	description?: string;
	flags?: {
		[index: string]: {
			cascades?: boolean;
			description?: string;
			shorthand?: string;
		};
	};
	options?: {
		[index: string]: {
			accepts?: string[];
			cascades?: boolean;
			description?: string;
			required?: boolean;
			shorthand?: string;
			type?: 'integer' | 'float';
		};
	};
	executeOnCascade?: boolean;
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
	options: (string | number)[];
	values: (string | number)[];
}

export interface Settings {
	app: AppSettings;
	arguments: string[];
	mainFilename: string;
	newVersionWarning: {
		enabled: boolean;
		installedGlobally: boolean;
	};
	onStart?: string | Function;
	packageFilePath: string;
	spacing: {
		after: number;
		before: number;
	};
	usageCommand?: string;
	verbose?: boolean;
}
