async function dataAllows() {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return ['a1', 'b1', 'c1', 'd1'];
}

async function testAllows() {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return ['a2', 'b2', 'c2', 'd2'];
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
