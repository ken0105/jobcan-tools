import puppeteer, { Browser, Page } from 'puppeteer'
import { Runner } from './Runner'

export abstract class BaseRunner implements Runner {
  async run(): Promise<void> {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080'],
      defaultViewport: null,
    })
    const _page = await browser.newPage()
    await this.exec(browser, _page)
    await browser.close()
  }

  protected abstract exec(browser: Browser, page: Page): any
}
