// Import and initialize Waterfall CLI
const waterfall = require('../../../../dist/index');

waterfall.init({
	verbose: true,
	onStart: () => {
		console.log('This is the onStart function');
	},
});
