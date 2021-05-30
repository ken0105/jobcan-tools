"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRunner_1 = require("./BaseRunner");
const login_1 = require("./login");
const sleep_1 = require("./sleep");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
class ClockPuncher extends BaseRunner_1.BaseRunner {
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
        await page.click("#menu_adit_img");
        await page.click("#menu_adit > a:nth-child(1)");
        await page.waitForNavigation();
        const now = dayjs_1.default().utc().local().format("hh:mm");
        await page.type(`input[name="time"]`, now);
        await page.select(`select[name="group_id"]`, "5");
        console.log(`打刻した時間は ${now} です。`);
        await sleep_1.sleep(3000);
    }
}
exports.default = ClockPuncher;
(async () => {
    const runner = new ClockPuncher();
    await runner.run();
})();
