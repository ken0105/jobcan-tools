"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRunner_1 = require("./BaseRunner");
const login_1 = require("./login");
const sleep_1 = require("./sleep");
class ManpowerInputter extends BaseRunner_1.BaseRunner {
    async exec(browser, page) {
        await login_1.login(page);
        await sleep_1.sleep(1000);
        const [newPage] = await Promise.all([
            browser
                .waitForTarget((t) => t.opener() === page.target())
                .then((t) => t.page()),
            page.click("#jbc-app-links > ul > li:nth-child(2) > a"),
        ]);
        await newPage.waitForSelector("body > header > div.jbcid-header > nav > div.jbcid-navbar-header > a", { visible: true });
        page = newPage;
        await page.click("#menu_man_hour_manage_img");
        await page.click("#menu_man_hour_manage > a:nth-child(1)");
        await page.waitForNavigation();
        const tableRows = (await page.$$("#search-result > table > tbody > tr"))
            .length;
        let currentRow = 0;
        while (currentRow < tableRows) {
            currentRow++;
            console.log(`day ${currentRow} is processing`);
            let ele = await page.$(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(3) > span`);
            if (ele == null) {
                console.log(`day ${currentRow} is skipped`);
                continue;
            }
            ele = await page.$(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(2)`);
            const workHour = await page.evaluate((elm) => elm.textContent, ele);
            console.log(workHour);
            await page.click(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(4) > div`);
            await sleep_1.sleep(1000);
            await page.click(`#edit-menu-contents > table > tbody > tr > td:nth-child(5) > span`);
            await page.select(`select[name="projects[]"]`, "27");
            await page.select(`select[name="tasks[]"]`, "2");
            await page.select(`select[name="tasks[]"]`, "2");
            await page.type(`input[name="minutes[]"`, workHour);
            await clickSave(page);
            await sleep_1.sleep(2000);
            console.log("saved");
        }
        console.log("finished");
    }
}
exports.default = ManpowerInputter;
(async () => {
    const runner = new ManpowerInputter();
    await runner.run();
})();
async function clickSave(page) {
    await page.click(`#save`);
    try {
        page.click(`#save`);
    }
    catch (e) { }
    try {
        page.click(`#save`);
    }
    catch (e) { }
}
