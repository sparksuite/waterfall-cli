// Import and initialize Waterfall CLI
const waterfall = require('waterfall-cli');

waterfall
	.init({
		verbose: true,
		onStart: 'Invalid value',
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
