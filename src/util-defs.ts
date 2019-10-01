export interface AppSettings {
	name: string | null;
	packageName: string | null;
	version: string | null;
	[propName: string]: string | number | null;
}

interface CommandSpecOption {
	accepts?: string[];
	cascades?: boolean;
	description?: string;
	required?: boolean;
	shorthand?: string;
	type?: string;
}

interface CommandSpecOptions {
	[propName: string]: CommandSpecOption;
}

interface CommandSpecFlag {
	cascades?: boolean;
	description?: string | null;
	shorthand?: string;
}

interface CommandSpecFlags {
	[propName: string]: CommandSpecFlag;
}

interface CommandSpecData {
	accepts?: string[];
	description?: string;
	ignoreFlagsAndOptions?: boolean;
	required?: boolean;
	type?: string;
}

export interface CommandSpec {
	data?: CommandSpecData;
	description?: string | null;
	flags: CommandSpecFlags;
	options: CommandSpecOptions;
	executeOnCascade?: boolean;
}

interface ConstructorSettingsSpacing {
	after?: number;
	before?: number;
}

interface NewVersionWarningSettings {
	enabled: boolean;
	installedGlobally: boolean;
}

export interface ConstructorSettings {
	app?: AppSettings;
	arguments?: string[];
	mainFilename: string;
	newVersionWarning?: NewVersionWarningSettings;
	onStart?: string | Function | null;
	packageFilePath?: string;
	spacing?: ConstructorSettingsSpacing;
	usageCommand?: string;
	verbose?: boolean;
}

export interface OrganizedArguments {
	command: string;
	data: string | number | null;
	flags: string[];
	options: (string | number)[];
	values: (string | number)[];
}
