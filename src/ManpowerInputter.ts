import { Browser, Page } from 'puppeteer'
import { BaseRunner } from './BaseRunner'
import { login } from './login'
import { sleep } from './sleep'
import dayjs from 'dayjs'
const env = process.env

class ManpowerInputter extends BaseRunner {
  protected async exec(browser: Browser, page: Page) {
    // @ts-ignore
    let enableEasyInputSetting = Boolean(JSON.parse(env.ENABLE_EASY_INPUT_SETTING))
    // @ts-ignore
    let enablePreviousMonthInput = Boolean(JSON.parse(env.ENABLE_PREVIOUS_MONTH_INPUT))
    let easyInputSettingTimeHours = 0
    let easyInputSettingTimeMinutes = 0
    let easyInputSettingRecords = 0
    let mainProjectOptionValue = 0
    if (enableEasyInputSetting) {
      easyInputSettingTimeHours = Number(env.EASY_INPUT_SETTING_TIME_HOURS)
      easyInputSettingTimeMinutes = Number(env.EASY_INPUT_SETTING_TIME_MINUTES)
      easyInputSettingRecords = Number(env.EASY_INPUT_SETTING_RECORDS)
      if (isNaN(easyInputSettingTimeHours) || isNaN(easyInputSettingTimeMinutes) || !easyInputSettingRecords) {
        console.error('環境変数不正')
        return
      }
    }
    mainProjectOptionValue = Number(env.MAIN_PROJRCT_OPTION_VALUE)
    if (!mainProjectOptionValue) {
      console.error('環境変数不正')
      return
    }

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

    if (enablePreviousMonthInput) {
      await goBackPreviousMonth(page)
    }

    const tableRows = (await page.$$('#search-result > table > tbody > tr')).length
    let currentRow = 0

    while (currentRow < tableRows) {
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
        totalWorkHour = subtractHHMM(totalWorkHour, easyInputSettingTimeHours, easyInputSettingTimeMinutes)
      }
      await page.click(`#search-result > table > tbody > tr:nth-child(${currentRow}) > td:nth-child(4) > div`)
      await sleep(1000)
      let paddingRecords = 0
      if (isWorkday(totalWorkHour) && enableEasyInputSetting) {
        await page.select(`select[name="template"]`, '1')
        paddingRecords = easyInputSettingRecords
      }
      await sleep(200)
      await page.click(`#edit-menu-contents > table > tbody > tr:nth-child(1) > td:nth-child(5) > span`)
      await page.select(
        `#edit-menu-contents > table > tbody > tr:nth-child(${paddingRecords + 2}) > td:nth-child(2) > select`,
        String(mainProjectOptionValue),
      )
      await page.select(
        `#edit-menu-contents > table > tbody > tr:nth-child(${paddingRecords + 2}) > td:nth-child(3) > select`,
        '2',
      )
      await page.type(
        `#edit-menu-contents > table > tbody > tr:nth-child(${
          paddingRecords + 2
        }) > td:nth-child(4) > input.form-control.jbc-form-control.form-control-sm.man-hour-input`,
        totalWorkHour,
      )
      await clickSave(page)
      await sleep(2000)
      console.log('saved')
      if (enablePreviousMonthInput) {
        await goBackPreviousMonth(page)
      }
    }
    console.log('finished')
  }
}

function isWorkday(workHour: String): Boolean {
  return workHour != '00:00'
}

;(async () => {
  const runner = new ManpowerInputter()
  await runner.run()
})()

async function clickSave(page: Page) {
  await page.click(`#save`)
  try {
    page.click(`#save`)
  } catch (e) {}
  try {
    page.click(`#save`)
  } catch (e) {}
}

async function goBackPreviousMonth(p: Page) {
  const targetMonth = dayjs().month()
  if(targetMonth == 0) {
    await p.select(`select[name="year"]`, String(dayjs().year() - 1))
    await sleep(1000)
    await p.select(`select[name="month"]`, "12")
  } else {
    await p.select(`select[name="month"]`, targetMonth.toString())
  }
  await sleep(1000)
}

function subtractHHMM(base: String, hour: number, minute: number): String {
  let d = dayjs()
  d = d.hour(Number(base.split(':')[0]))
  d = d.minute(Number(base.split(':')[1]))
  d = d.subtract(hour, 'hour')
  d = d.subtract(minute, 'minute')
  return d.hour() + ':' + d.minute()
}
