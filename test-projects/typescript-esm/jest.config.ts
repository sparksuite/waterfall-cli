import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	displayName: 'Test suite',
	verbose: true,
	preset: 'ts-jest',
	testMatch: ['<rootDir>/*.test.ts'],
};

export default config;
