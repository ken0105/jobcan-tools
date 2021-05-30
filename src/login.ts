import { Page } from 'puppeteer'
import * as dotenv from 'dotenv'
dotenv.config()

export async function login(p: Page) {
  const env = process.env
  let page = p
  await page.goto('https://id.jobcan.jp/users/sign_in/')
  await page.type('#user_email', env.USER_ID!)
  await page.type('#user_password', env.USER_PASS!)
  await page.click('#new_user > input.form__login')
}
