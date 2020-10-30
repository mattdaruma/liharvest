const puppeteer = require('puppeteer')
const fs = require('fs')
const creds = JSON.parse(fs.readFileSync('./creds.json', 'utf-8'))

async function puppetLogin(){
    let browser = await puppeteer.launch({headless: false,
        userDataDir: './user-data'
       })
    let page = await browser.newPage()
    await page.goto('https://www.linkedin.com/uas/login',{waitUntil: 'networkidle0'})
    await page.type('#username', creds.user)
    await page.type('#password', creds.pass)
    await page.click('.btn__primary--large')
    await page.waitForNavigation()
    browser.close()
}
puppetLogin();