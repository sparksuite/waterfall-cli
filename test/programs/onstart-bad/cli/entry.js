// Import and initialize Waterfall CLI
const waterfall = require('../../../../dist/index');

const onStart = 'This is not a function';

waterfall.init({
	verbose: true,
	onStart: onStart,
});
