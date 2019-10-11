// Import and initialize Waterfall CLI
const waterfall = require('../../../../dist/index');

const onStart = function() {
	console.log('This is the onStart function');
};

const onstartSettings = process.env.onstartSettings || 'default';

const settings = {
	default: {
		verbose: true,
	},
	onStartGood: {
		verbose: true,
		onStart: onStart,
	},
	onStartBad: {
		verbose: true,
		onStart: 'onStart',
	},
}[onstartSettings];

console.log('Using settings set: ' + onstartSettings);

waterfall.init(settings);

console.log('Successful program termination');
