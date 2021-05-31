import { BaseRunner } from './BaseRunner'
import { Browser, Page } from 'puppeteer'
import { login } from './login'
import { sleep } from './sleep'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export default class ClockPuncher extends BaseRunner {
  protected async exec(browser: Browser, page: Page) {
    await login(page)
    await sleep(1000)
    const [newPage] = await Promise.all([
      browser.waitForTarget(t => t.opener() === page.target()).then(t => t.page()),
      page.click('#jbc-app-links > ul > li:nth-child(2) > a'),
    ])

    await newPage!.waitForSelector('body > header > div.jbcid-header > nav > div.jbcid-navbar-header > a', {
      visible: true,
    })
    page = newPage!
    await page.click('#menu_adit_img')
    await page.click('#menu_adit > a:nth-child(1)')
    await page.waitForNavigation()

    const now = dayjs().utc().local().format('hhmm')
    await page.type(`input[name="time"]`, now)
    await page.select(`select[name="group_id"]`, '5')
    // ここをアンコメントすると打刻されます
    // await page.click("#insert_button")
    console.log(`打刻した時間は ${now} です。`)
    await sleep(3000)
  }
}

;(async () => {
  const runner = new ClockPuncher()
  await runner.run()
})()
