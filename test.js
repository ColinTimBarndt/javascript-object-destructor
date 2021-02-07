import addDestructor from "./index.js";

window.objs = {
	test: addDestructor(
		() => [1, 2, 3, 4],
		() => console.log("test has been destroyed.")
	),
};
