interface AppSettings {
	name: string | null;
	packageName: string | null;
	version: string | null;
	[propName: string]: any;
}

interface NewVersionWarning {
	enabled: boolean;
	installedGlobally: boolean;
}

interface SpacingSettings {
	before: number;
	after: number;
}

interface Settings {
	app: AppSettings;
	arguments: any;
	mainFilename: string;
	newVersionWarning: NewVersionWarning;
	onStart: string | null;
	packageFilePath: string;
	spacing: SpacingSettings;
	usageCommand: string;
	verbose: boolean;
}







interface CommandSpecOptions {
	[propName: string]: any;
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
	[propName: string]: any;
}

interface CommandSpec {
	description?: string | null;
	data?: CommandSpecData;
	flags: CommandSpecFlags;
	options: CommandSpecOptions;
	executeOnCascade?: boolean;
}

interface ConstructorSettings {
	verbose?: boolean;
	mainFilename?: string;
	packageFilePath?: string;
	app?: AppSettings;
	arguments?: string[];
	spacing?: {
		after?: number | null;
	}
	[propName: string]: any;
}

interface OrganizedArguments {
	flags: any[];
	options: any[];
	values: any[];
	data: any | null;
	command: string;
}

interface InputObject {
	command: string | null;
	data: any | null;
	[propName: string]: any;
}
interface Utils {
	verboseLog(message:string): void;
	processArguments(argv: string[]): string[];
	retrieveAppInformation(): AppSettings;
	getMergedSpec(command: string): CommandSpec;
	organizeArguments(): OrganizedArguments;
	constructInputObject(organizedArguments: OrganizedArguments): object;
	convertDashesToCamelCase(string: string): string;
	getAllProgramCommands(): string[];
	printPrettyError(message: string): void;
	
	files: {
		getAllDirectories(string: string): string[];
		isDirectory(path: string): boolean;
		isFile(path: string): boolean;
		getFiles(directory: string): string[];
		getDirectories(directory: string): string[];
		getAllDirectories(directory: string): string[];
	}
}