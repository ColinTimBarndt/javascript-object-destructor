/**
 * @param objCreator A function that creates an object.
 * @param objDestructor A function that is called if the object is garbage collected.
 */
export declare function addDestructor<T extends object>(objCreator: () => T, objDestructor: () => void): T;
/**
 * Changes the garbage collection detection interval. Default is 500ms.
 * @param interval
 */
export declare function setDetectionInterval(interval: number): void;
