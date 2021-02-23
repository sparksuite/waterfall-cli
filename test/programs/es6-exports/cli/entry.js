// Import and initialize Waterfall CLI
import waterfall from 'waterfall-cli';

waterfall
	.init({
		verbose: true,
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
