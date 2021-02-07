/**
 * @typedef {{
 * 	 deref: () => T|undefined;
 * }} WeakRef<T>
 * @template T
 */
/**
 * @typedef {{
 *   new(obj: T) => WeakRef<T>;
 * }} WeakRefConstructor<T>
 * @template T
 */

/**
 * @type {Map<WeakRef<Object>, () => void>}
 */
const destructors = new Map();

setInterval(() => {
	destructors.forEach((des, ref) => {
		if (ref.deref()) return;
		// Garbage collected
		destructors.delete(ref);
		console.log("Collected");
		try {
			des();
		} catch (e) {
			console.error(e);
		}
	});
}, 5000);

/**
 * @param {() => T} objCreator A function that creates an object.
 * @param {() => void} objDestructor A function that is called if the object is garbage collected.
 * @returns {T}
 * @template T
 */
export default function addDestructor(objCreator, objDestructor) {
	const sym = Symbol("destructor");
	{
		const obj = objCreator();
		if (typeof obj !== "object")
			throw new TypeError("The created object is not an object.");
		const desObj = Object.freeze({ destructor: sym });
		destructors.set(new WeakRef(desObj), objDestructor);
		Object.defineProperty(obj, sym, { value: desObj, writable: false });
		return obj;
	}
}
