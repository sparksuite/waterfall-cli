// Imports
import { InputObject } from '../utils/construct-input-object.js';

// Export type
type CommandFunction = (input: InputObject) => Promise<void>;
export default CommandFunction;
