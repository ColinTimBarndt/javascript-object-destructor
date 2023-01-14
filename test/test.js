import {addDestructor} from "../dist/index.esm.js";

window.objs = {
	test: addDestructor(
		() => [1, 2, 3, 4],
		() => console.log("test has been destroyed.")
	),
};
delete window.objs;
