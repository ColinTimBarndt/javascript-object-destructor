const destructors = new Map<WeakRef<object>, () => void>();

let detectionIntervalHandle: number | undefined = undefined;
let detectionInterval = 500;

/**
 * @param objCreator A function that creates an object.
 * @param objDestructor A function that is called if the object is garbage collected.
 */
export function addDestructor<T extends object>(objCreator: () => T, objDestructor: () => void): T {
	const obj: T = objCreator();
	if (typeof obj !== "object") {
		throw new TypeError("Creator did not return an object.");
	}

	//const sym: unique symbol = Symbol("destructor");

	// Dummy object used for detecting destruction
	//const desObj = Object.freeze({});
	destructors.set(new WeakRef(obj), objDestructor);
	//Object.defineProperty(obj, sym, { value: desObj, writable: false });

	if (detectionIntervalHandle === undefined) {
		detectionIntervalHandle = setInterval(detectGC, detectionInterval);
	}

	return obj;
}

/**
 * Changes the garbage collection detection interval. Default is 500ms.
 * @param interval
 */
export function setDetectionInterval(interval: number) {
	if (detectionInterval === interval) return;

	detectionInterval = interval;
	if (detectionIntervalHandle !== undefined) {
		clearInterval(detectionIntervalHandle);
		setInterval(detectGC, detectionInterval);
	}

}

function detectGC() {
	destructors.forEach((destructor, ref) => {
		if (ref.deref()) return;
		// Garbage collected
		destructors.delete(ref);
		try {
			destructor();
		} catch (e) {
			console.error("Exception during destructor call:", e);
		}
	});

	if (destructors.size < 1) {
		clearInterval(detectionIntervalHandle);
		detectionIntervalHandle = undefined;
	}
}
