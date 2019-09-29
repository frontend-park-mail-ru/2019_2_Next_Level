/**
 * Generates a call wrapper for `func`. Calling this wrapper is equivalent to invoking `func` with some of its arguments
 * bounds to args
 * @param   {function} func
 * @param   {[*]} argsBound
 * @returns {function(...[*]): *}
 */
export function partial(func, ...argsBound) {
	return function(...args) {
		return func.call(this, ...argsBound, ...args);
	};
}
