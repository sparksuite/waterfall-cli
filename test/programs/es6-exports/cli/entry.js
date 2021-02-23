// Import and initialize Waterfall CLI
import * as waterfall from 'waterfall-cli';

waterfall.init({
	verbose: true,
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
