// Import and initialize Waterfall CLI
const waterfall = require('waterfall-cli');

waterfall
	.init({
		verbose: true,
		onStart: () => {
			console.log('This is the onStart function');
		},
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
