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

/**
 * Creates a random string of characters
 * 
 * Used to determine the Y.js room name
 * 
 * @param length The length of the ID
 * @returns A random string of characters
 */
export function makeId(length: number) {
    let result = '';

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    let counter = 0;

    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result;
}

/**
 * Generates a random nickname for the user
 * @returns An object containing a nickname and a color
 */
export function createUserMetadata() {


    const colorGroups = new Array<{
        color: string,
        light: string
    }>();

    const n = 40;
    for (let i = 0; i < n; i ++) {
        let hue = i / n * 255 | 0;
        colorGroups.push({
            color: `hsl(${hue}, 90%, 70%)`,
            light: `hsl(${hue}, 80%, 90%)`,
        });
    }

    // colorGroups = [
    //     { color: '#30bced', light: '#30bced' },
    //     { color: '#6eeb83', light: '#6eeb83' },
    //     { color: '#ffbc42', light: '#ffbc42' },
    //     { color: '#ecd444', light: '#ecd444' },
    //     { color: '#ee6352', light: '#ee6352' },
    //     { color: '#9ac2c9', light: '#9ac2c9' },
    //     { color: '#8acb88', light: '#8acb88' },
    //     { color: '#1be7ff', light: '#1be7ff' }
    // ]

    const colorGroup = colorGroups[Math.random() * colorGroups.length | 0];

    const userId = makeId(8);

    return { colorGroup, userId };
}

export function areExpressionsEqual(newExpressions: Desmos.ExpressionState[], pastExpressions: Desmos.ExpressionState[]) {

    // TODO: Use for loop here instead of JSON serialization

    return objectEquals(newExpressions, pastExpressions);

}

export function addTagToId(id: string, prefix: string, sep: string="||") {
    if (id.indexOf(sep) == -1) return prefix + sep + id;
    return id;
}