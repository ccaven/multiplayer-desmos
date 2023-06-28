import type { ExpressionState } from "desmos";

const pfpModules = import.meta.glob("../../static/animals/*.png");

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

    const colorGroups = [
        { color: '#30bced', light: '#30bced33' },
        { color: '#6eeb83', light: '#6eeb8333' },
        { color: '#ffbc42', light: '#ffbc4233' },
        { color: '#ecd444', light: '#ecd44433' },
        { color: '#ee6352', light: '#ee635233' },
        { color: '#9ac2c9', light: '#9ac2c933' },
        { color: '#8acb88', light: '#8acb8833' },
        { color: '#1be7ff', light: '#1be7ff33' }
    ]

    const imageUrls = [
        "animals/armadillo_1.png",
        "animals/capy_1.png",
        "animals/capy_2.png",
        "animals/cat_1.png",
        "animals/cat_2.png",
        "animals/cat_3.png",
        "animals/cat_4.png",
        "animals/cat_5.png",
        "animals/dog_1.png",
        "animals/dog_2.png",
        "animals/dog_3.png",
        "animals/dog_4.png",
        "animals/dolphin_1.png",
        "animals/dolphin_2.png",
        "animals/dolphin_3.png",
        "animals/dolphin_4.png",
        "animals/goldfish_1.png",
        "animals/goldfish_2.png",
        "animals/goldfish_3.png",
        "animals/penguin_1.png",
        "animals/penguin_2.png",
        "animals/penguin_3.png",
        "animals/polar_bear_1.png",
        "animals/polar_bear_2.png",
        "animals/polar_bear_3.png",
        "animals/polar_bear_4.png",
        "animals/turtle_1.png",
        "animals/turtle_2.png",
        "animals/turtle_3.png",
    ]

    const colorGroup = colorGroups[Math.random() * colorGroups.length | 0];
    const imageUrl = imageUrls[Math.random() * imageUrls.length | 0];

    const userId = makeId(8);

    return { imageUrl, colorGroup, userId };
}

export function areExpressionsEqual(newExpressions: ExpressionState[], pastExpressions: ExpressionState[]) {



    return objectEquals(newExpressions, pastExpressions);

}

export function addTagToId(id: string, prefix: string, sep: string="||") {
    if (id.indexOf(sep) == -1) return prefix + sep + id;
    return id;
}