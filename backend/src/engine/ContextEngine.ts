import get from 'lodash/get';

/**
 * Interpolates a string containing {{variables}} with data from the context.
 * E.g. "SELECT * FROM users WHERE id = {{trigger.payload.userId}}" -> "SELECT * FROM users WHERE id = 123"
 */
export function interpolateString(template: string, contextData: any): string {
    if (typeof template !== 'string') return template;

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = get(contextData, path.trim());
        if (value === undefined) {
            return match; // Leave un-replaced if not found
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    });
}

/**
 * Recursively interpolates all string properties in an object.
 */
export function interpolateObject(obj: any, contextData: any): any {
    if (!obj) return obj;
    if (typeof obj === 'string') return interpolateString(obj, contextData);
    if (Array.isArray(obj)) return obj.map(item => interpolateObject(item, contextData));
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = interpolateObject(obj[key], contextData);
        }
        return result;
    }
    return obj;
}
