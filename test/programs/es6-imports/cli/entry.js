// Import and initialize Waterfall CLI for an es6 module importing a commonjs module
// -> see: https://nodejs.org/api/modules.html#modules_module_createrequire_filename
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const waterfallCLI = require('../../../../dist/index.js').default;

waterfallCLI({
	verbose: true,
});
