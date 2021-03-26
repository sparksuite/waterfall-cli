// Imports
import fs from 'fs';
import path from 'path';
import getContext from './get-context.js';

/** Get all commands in program */
export default async function getAllProgramCommands(): Promise<string[]> {
	// Get child directories of a parent directory, recursively & synchronously
	const getAllDirectories = (directory: string): string[] => {
		const isDirectory = (path: string): boolean => {
			return fs.lstatSync(path).isDirectory();
		};

		if (!fs.existsSync(directory)) {
			return [];
		}

		return fs.readdirSync(directory).reduce((files: string[], file: string) => {
			const name = path.join(directory, file);

			if (isDirectory(name)) {
				return [...files, name, ...getAllDirectories(name)];
			}

			return [...files];
		}, []);
	};

	// Get the context
	const context = await getContext();

	// Get all directories
	const mainDir = path.dirname(context.entryFile);
	let commands = getAllDirectories(mainDir);

	// Process into just commands
	commands = commands.map((file) => file.replace(`${mainDir}/`, ''));
	commands = commands.map((file) => file.replace(/\.js$/, ''));
	commands = commands.map((file) => file.replace(/\//, ' '));

	// Return
	return commands;
}
