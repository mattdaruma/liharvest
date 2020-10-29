const puppeteer = require('puppeteer')
const fs = require('fs')
const creds = JSON.parse(fs.readFileSync('./creds.json', 'utf-8'))
async function capturePage(page, name){
    console.log('capture', name)
    let content = await page.content();
    await page.screenshot({path: `./captures/${name}.png`})
    fs.writeFileSync(`./captures/${name}.html`, content)
}
async function puppetLiharvest(){
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    await capturePage(page, 'Blank')
    await page.goto('https://www.linkedin.com/uas/login')
    await page.waitForNavigation();
    await capturePage(page, 'Login')
    await page.type('#username', creds.user)
    await page.type('#password', creds.pass)
    await page.click('.btn__primary--large')
    await page.waitForNavigation()
    await capturePage(page, 'Navigated')
    let cookies = page.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2))
    await page.goto('https://www.linkedin.com/sales/search/people')
    await page.waitForNavigation();
    await capturePage(page, 'Search')
    await browser.close()
}
puppetLiharvest();