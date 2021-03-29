// Imports
import { InputObject } from '../utils/construct-input-object.js';
import { CommandInput, EmptyCommandInput } from '../utils/get-command-spec.js';

// Export type
type CommandFunction<Input extends CommandInput = EmptyCommandInput> = (input: InputObject<Input>) => Promise<void>;
export default CommandFunction;
