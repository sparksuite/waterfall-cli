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
	after: number;
	before: number;
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

interface CommandSpec {
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

interface ConstructorSettings {
	app?: AppSettings;
	arguments?: string[];
	mainFilename?: string;
	packageFilePath?: string;
	spacing?: ConstructorSettingsSpacing;
	usageCommand?: string;
	verbose?: boolean;
}

interface OrganizedArguments {
	command: string;
	data: string | number | null;
	flags: string[];
	options: (string | number)[];
	values: (string | number)[];
}

interface InputObject {
	command: string | null;
	data: string | number | null;
	[propName: string]: boolean | string | number | undefined | null;
}
interface Utils {
	constructInputObject(organizedArguments: OrganizedArguments): object;
	convertDashesToCamelCase(string: string): string;
	getAllProgramCommands(): string[];
	getMergedSpec(command: string): CommandSpec;
	organizeArguments(): OrganizedArguments;
	printPrettyError(message: string): void;
	processArguments(argv: string[]): string[];
	retrieveAppInformation(): AppSettings;
	verboseLog(message: string): void;

	files: {
		isDirectory(path: string): boolean;
		isFile(path: string): boolean;
		getAllDirectories(directory: string): string[];
		getAllDirectories(string: string): string[];
		getDirectories(directory: string): string[];
		getFiles(directory: string): string[];
	};
}
