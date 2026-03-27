/**
 * Utility function to safely ensure data is an array
 * Handles various response formats from API
 * 
 * @param data - The data to check (can be array, object with content/tasks, or null)
 * @returns An array of type T, empty array if data is invalid
 * 
 * @example
 * // Returns array directly
 * ensureArray([1, 2, 3]) // [1, 2, 3]
 * 
 * @example
 * // Extracts tasks from object
 * ensureArray({ tasks: [1, 2], total: 2 }) // [1, 2]
 * 
 * @example
 * // Returns empty array for null/undefined
 * ensureArray(null) // []
 */
export function ensureArray<T>(data: unknown): T[] {
  // If already an array, return as-is
  if (Array.isArray(data)) {
    return data;
  }
  
  // If it's an object, try to extract common array properties
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    
    // Check for common array property names
    if (Array.isArray(obj.tasks)) {
      return obj.tasks as T[];
    }
    if (Array.isArray(obj.content)) {
      return obj.content as T[];
    }
    if (Array.isArray(obj.items)) {
      return obj.items as T[];
    }
    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }
  }
  
  // Return empty array for everything else
  return [];
}

/**
 * Safely get the first item from an array
 * 
 * @param data - The data to extract from
 * @returns The first item or undefined
 */
export function firstItem<T>(data: unknown): T | undefined {
  const arr = ensureArray<T>(data);
  return arr.length > 0 ? arr[0] : undefined;
}

/**
 * Check if data is a non-empty array
 * 
 * @param data - The data to check
 * @returns True if data is a non-empty array
 */
export function isNonEmptyArray(data: unknown): boolean {
  return Array.isArray(data) && data.length > 0;
}
