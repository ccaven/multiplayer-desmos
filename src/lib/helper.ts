/**
 * Create a cache to avoid computing the output for two identical inputs
 * @param f The function to memoize
 */
function memoize<T, K>(f: (a: T) => K) {
    let mem = new Map<T, K>();
    return (a: T) => {
        if (mem.has(a)) return mem.get(a);
        let value = f(a);
        mem.set(a, value);
        return value;
    };
}

/**
 * A memoized version of JSON.stringify
 */
export const stringify = memoize(JSON.stringify);

/**
 * Use JSON.stringify to determine if two objects are equal
 * @param a - The first object
 * @param b - The second object
 */
export function objectEquals(a: any, b: any) {
    return stringify(a) == stringify(b);
}