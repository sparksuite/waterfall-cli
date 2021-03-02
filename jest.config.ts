import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	displayName: 'Test suite',
	verbose: true,
	preset: 'ts-jest',
	resolver: 'jest-ts-webcompat-resolver',
	testMatch: ['<rootDir>/tests/*.test.ts'],
};

export default config;
