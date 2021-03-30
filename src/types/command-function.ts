// Imports
import { InputObject } from '../utils/construct-input-object.js';
import { CommandInput, EmptyCommandInput } from '../utils/get-command-spec.js';

/** Describes a function that's executed when a command is run */
type CommandFunction<Input extends CommandInput = EmptyCommandInput> = (input: InputObject<Input>) => Promise<void>;
export default CommandFunction;
