export default function addDestructor<T>(
	objCreator: () => T,
	objDestructor: () => void
): T;
