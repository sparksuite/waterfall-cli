interface AppSettings {
	name: string | null;
	packageName: string | null;
	version: string | null;
	[propName: string]: string | number | null;
}

interface NewVersionWarningSettings {
	enabled: boolean;
	installedGlobally: boolean;
}

interface SpacingSettings {
	before: number;
	after: number;
}

interface Settings {
	app: AppSettings;
	arguments: string[];
	mainFilename: string;
	newVersionWarning: NewVersionWarningSettings;
	onStart: string | null;
	packageFilePath: string;
	spacing: SpacingSettings;
	usageCommand: string;
	verbose: boolean;
}

interface CommandSpecOption {
	description?: string;
	required?: boolean;
	type?: string;
	accepts?: string[];
	shorthand?: string;
	cascades?: boolean;
}

interface CommandSpecOptions {
	[propName: string]: CommandSpecOption;
}

interface CommandSpecFlag {
	shorthand?: string;
	description?: string | null;
	cascades?: boolean;
}

interface CommandSpecFlags {
	[propName: string]: CommandSpecFlag;
}

interface CommandSpecData {
	ignoreFlagsAndOptions?: boolean;
	accepts?: string[];
	[propName: string]: boolean | string | string[] | number | undefined;
}

interface CommandSpec {
	description?: string | null;
	data?: CommandSpecData;
	flags: CommandSpecFlags;
	options: CommandSpecOptions;
	executeOnCascade?: boolean;
}

interface ConstructorSettingsSpacing {
	after?: number;
	before?: number;
}

interface ConstructorSettings {
	verbose?: boolean;
	mainFilename?: string;
	packageFilePath?: string;
	app?: AppSettings;
	arguments?: string[];
	spacing?: ConstructorSettingsSpacing;
	[propName: string]:
		| boolean
		| string
		| number
		| AppSettings
		| ConstructorSettingsSpacing
		| string[]
		| undefined;
}

interface OrganizedArguments {
	flags: string[];
	options: (string | number)[];
	values: (string | number)[];
	data: string | number | null;
	command: string;
}

interface InputObject {
	command: string | null;
	data: string | number | null;
	[propName: string]: boolean | string | number | undefined | null;
}
interface Utils {
	verboseLog(message: string): void;
	processArguments(argv: string[]): string[];
	retrieveAppInformation(): AppSettings;
	getMergedSpec(command: string): CommandSpec;
	organizeArguments(): OrganizedArguments;
	constructInputObject(organizedArguments: OrganizedArguments): object;
	convertDashesToCamelCase(string: string): string;
	getAllProgramCommands(): string[];
	printPrettyError(message: string): void;

	files: {
		isDirectory(path: string): boolean;
		isFile(path: string): boolean;
		getFiles(directory: string): string[];
		getDirectories(directory: string): string[];
		getAllDirectories(string: string): string[];
		getAllDirectories(directory: string): string[];
	};
}
