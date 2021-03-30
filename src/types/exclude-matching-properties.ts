export interface ExcludeMe {
	excludeMe: true;
}

export type OmitExcludeMeProperties<T> = Pick<
	T,
	{ [K in keyof T]: NonNullable<T[K]> extends ExcludeMe ? never : K }[keyof T]
>;
