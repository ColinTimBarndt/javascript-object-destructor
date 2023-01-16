const {test} = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const {untilDestroyed} = require("../src");

const lib = fs.readFileSync(path.join(__dirname, "../dist/index.js"), "utf8");

/**
 * @typedef {import("@playwright/test").PlaywrightTestArgs} PlaywrightTestArgs
 */

/**
 * @param {PlaywrightTestArgs["page"]} page
 * @param {string="destructor"} text
 * @returns
 */
function waitForConsole(page, text = "destructor") {
    return page.waitForEvent("console", {predicate: msg => msg.text() === text});
}

test.beforeEach(async ({page}) => {
    await page.goto("about:blank");
    // Bind all exports to window
    await page.evaluate(() => window.exports = window);
    await page.addScriptTag({content: lib});
});

test.describe("Browser", () => {
    test("destructor on delete", async ({page}) => {
        const done = waitForConsole(page);
        await page.evaluate(() => {
            let o = [1, 2, 3, 4];
            onDestroy(o, () => console.log("destructor"));
            o = null;
        });
        await done;
    });

    test("destructor on out of scope", async ({page}) => {
        const done = waitForConsole(page);
        await page.evaluate(() => {
            wrapper();
            function wrapper() {
                const o = [1, 2, 3, 4];
                onDestroy(o, () => console.log("destructor"));
            }
        });
        await done;
    });

    test("destructor on delete async", async ({page}) => {
        await page.evaluate(async () => {
            let o = [1, 2, 3, 4];
            const lock = untilDestroyed(o);
            o = null;
            await lock;
        });
    });
});
