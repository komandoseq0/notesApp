import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return typeof initialValue === 'function'
				? (initialValue as () => T)()
				: initialValue;
		}

		try {
			const jsonValue = localStorage.getItem(key);
			if (jsonValue == null) {
				return typeof initialValue === 'function'
					? (initialValue as () => T)()
					: initialValue;
			} else {
				return JSON.parse(jsonValue);
			}
		} catch {
			return typeof initialValue === 'function'
				? (initialValue as () => T)()
				: initialValue;
		}
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(key, JSON.stringify(value));
		}
	}, [key, value]);

	return [value, setValue] as [T, typeof setValue];
}
