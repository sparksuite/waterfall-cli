// Imports
import { PrintableError } from './errors.js';
import getMergedSpec from './get-merged-spec.js';
import getOrganizedArguments from './get-organized-arguments.js';

// Define what the input object looks like
interface InputObject {
	command: string;
	data?: string | number;
	passThrough?: string[];
	[index: string]: boolean | string | string[] | number | undefined;
}

// Construct a full input object
export default async function constructInputObject(): Promise<InputObject> {
	// Initialize
	const inputObject: InputObject = {
		command: '',
	};

	// Get organized arguments
	const organizedArguments = await getOrganizedArguments();

	// Get merged spec for this command
	const mergedSpec = await getMergedSpec(organizedArguments.command);

	// Convert a string from aaa-aaa-aaa to aaaAaaAaa
	const convertDashesToCamelCase = (string: string): string => {
		return string.replace(/-(.)/g, (g) => g[1].toUpperCase());
	};

	// Loop over each component and store
	Object.entries(mergedSpec.flags).forEach(([flag]) => {
		const camelCaseKey = convertDashesToCamelCase(flag);
		inputObject[camelCaseKey] = organizedArguments.flags.includes(flag);
	});

	Object.entries(mergedSpec.options).forEach(([option, details]) => {
		const camelCaseKey = convertDashesToCamelCase(option);
		const optionIndex = organizedArguments.options.indexOf(option);
		inputObject[camelCaseKey] = organizedArguments.values[optionIndex];

		if (details.required && !organizedArguments.options.includes(option)) {
			throw new PrintableError(`The --${option} option is required`);
		}
	});

	// Handle missing required data
	if (mergedSpec.data && mergedSpec.data.required && !organizedArguments.data) {
		throw new PrintableError('Data is required');
	}

	// Store data
	inputObject.data = organizedArguments.data;

	// Store command
	inputObject.command = organizedArguments.command;

	// Store pass-through
	if (organizedArguments.passThrough) {
		inputObject.passThrough = organizedArguments.passThrough;
	}

	// Return
	return inputObject;
}
