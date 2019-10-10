// Import and initialize Waterfall CLI
const waterfall = require('../../../../../dist/index');

const onStart = function() {
	console.log('This is the onStart function');
};

waterfall.init({
	verbose: true,
	onStart: onStart,
});
