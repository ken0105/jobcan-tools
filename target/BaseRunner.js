"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRunner = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class BaseRunner {
    async run() {
        const browser = await puppeteer_1.default.launch({
            headless: false,
            args: ["--window-size=1920,1080"],
            defaultViewport: null,
        });
        const _page = await browser.newPage();
        await this.exec(browser, _page);
        await browser.close();
    }
}
exports.BaseRunner = BaseRunner;
