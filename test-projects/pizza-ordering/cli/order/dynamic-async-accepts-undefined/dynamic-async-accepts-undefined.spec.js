async function dataAllows() {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return undefined;
}

async function testAllows() {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return undefined;
}

module.exports = {
	description: 'Just used for testing',
	data: {
		description: 'What type of pizza to order',
		accepts: dataAllows,
	},
	options: {
		test: {
			description: 'Just used for testing',
			accepts: testAllows,
		},
	},
	acceptsPassThroughArgs: false,
};
