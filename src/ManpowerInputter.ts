import { Browser, Page } from 'puppeteer'
import { BaseRunner } from './BaseRunner'
import { login } from './login'
import { sleep } from './sleep'

const registeredTime = 2

export default class ManpowerInputter extends BaseRunner {
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
    await page.click('#menu_man_hour_manage_img')
    await page.click('#menu_man_hour_manage > a:nth-child(1)')
    await page.waitForNavigation()

    const tableRows = (await page.$$('#search-result > table > tbody > tr')).length
    let currentRow = 0
    while (currentRow < tableRows) {
      let modalRegisteredRows = 0
      currentRow++
      console.log(`day ${currentRow} is processing`)
      let ele = await page.$(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(3) > span`)
      // eleがnullなら入力済
      if (ele == null) {
        console.log(`day ${currentRow} is skipped`)
        continue
      }
      ele = await page.$(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(2)`)
      let totalWorkHour = await page.evaluate(elm => elm.textContent, ele)
      if (isWorkday(totalWorkHour)) {
        totalWorkHour = totalWorkHour.split(":")[0] - registeredTime + ":" + totalWorkHour.split(":")[1]
      }

      await page.click(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(4) > div`)
      await sleep(1000);
      if (isWorkday(totalWorkHour)) {
        await page.select(`select[name="template"]`, '1')
        modalRegisteredRows += 2
      }
      await sleep(200)
      await page.click(`#edit-menu-contents > table > tbody > tr:nth-child(1) > td:nth-child(5) > span`)
      await page.select(`#edit-menu-contents > table > tbody > tr:nth-child(${modalRegisteredRows + 2}) > td:nth-child(2) > select`, '27')
      await page.select(`#edit-menu-contents > table > tbody > tr:nth-child(${modalRegisteredRows + 2}) > td:nth-child(3) > select`, '2')
      await page.type(`#edit-menu-contents > table > tbody > tr:nth-child(${modalRegisteredRows + 2}) > td:nth-child(4) > input.form-control.jbc-form-control.form-control-sm.man-hour-input`, totalWorkHour)
      await clickSave(page)
      await sleep(2000)
      console.log('saved')
    }
    console.log('finished')
  }
}

function isWorkday(workHour: String): Boolean { return workHour != "00:00" }


;(async () => {
  const runner = new ManpowerInputter()
  await runner.run()
})()

// saveが反応しない時があるので複数回押す
async function clickSave(page: Page) {
  await page.click(`#save`)
  try {
    page.click(`#save`)
  } catch (e) {}
  try {
    page.click(`#save`)
  } catch (e) {}
}
