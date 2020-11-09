const puppeteer = require('puppeteer')
const fs = require('fs');
const { finished } = require('stream');
const cheerio = require('cheerio')
const csvGenerator = require("./csv-generator.js")
let csvGen = new csvGenerator("li-harvest")
csvGen.setHeaders([
    'Name',
    'Title',
    'Company',
    'Tenure',
    'Location',
    'ProfileUrl'
])
function cleanString(input){
    return input.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, " ").replace('"', "").trim()
}
function getCsvValues(pageContent){
    let $ = cheerio.load(pageContent)
    let csv = "";
    $('.search-results__result-item').each((i, el) => {
        let name = cleanString($(el).find('.result-lockup__name').text())
        let titleCompany = cleanString($(el).find('.result-lockup__highlight-keyword').text())
        let titleCompanySplit = titleCompany.split(' at ')
        let companySplit = titleCompanySplit[1].split(' Go to ')
        let tenure = cleanString($(el).find('.result-lockup__tenure').parent().text())
        let location = cleanString($(el).find('.result-lockup__misc-list').parent().text())
        let profile = $(el).find('.result-lockup__name').find('a.ember-view').prop("href")
        csv += `"${name}","${titleCompanySplit[0]}", "${companySplit[0]}","${tenure}","${location}","https://www.linkedin.com${profile}"\r\n`
    })
    return csv;
}
async function puppetLiharvest(){
    let browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user-data',
        defaultViewport: null
       })
    let page = await browser.newPage()
    await page.goto('https://www.linkedin.com/sales/search/people',{waitUntil: 'networkidle0'})
    let listenForResults = async ()=>{
        return new Promise((resolve, reject)=>{
            let listenCounter = 0
            let checkResults = async ()=>{
                try{
                    await page.waitForSelector('.search-results__result-list')
                    resolve(true)
                }catch(err){
                    listenCounter++
                    console.warn('Results not found', listenCounter)
                    checkResults()
                }
            }
            checkResults()
        })
    }
    await listenForResults()
    let finishedCrawling = false
    let crawlCounter = 0
    while( !finishedCrawling && crawlCounter < 1000 ) {
        crawlCounter++
        try{
            await page.evaluate(async ()=>{
                await new Promise((resolve, reject)=>{
                    let counter = 0;
                    let timer = setInterval(()=>{
                        counter++;
                        let yScroll = Math.ceil(window.scrollY + 500)
                        window.scrollTo({top: yScroll, behavior: 'smooth'})
                        if(yScroll >= document.body.scrollHeight - window.innerHeight){
                            clearInterval(timer)
                            resolve()
                        }else{
                            if(counter >= 100){
                                reject()
                            }
                        }
                    }, 500)
                })
            })
        }catch(err){
            throw("Scrolling loop never completed.")
        }
        await new Promise((resolve, reject)=>{
            setTimeout(()=>{
                resolve()
            }, 3000)
        })
        let pageContent = await page.content()
        let csvLine = getCsvValues(pageContent)
        csvGen.addLine(csvLine)
        try{
            await page.click('.search-results__pagination-next-button')
            await new Promise((resolve, reject)=>{
                setTimeout(() => {
                    resolve()
                }, 1000);
            })
            await page.waitForSelector('.search-results__result-list')
        }catch(err){
            finishedCrawling = true;
            throw("Crawling ended.")
        }
    }
    if(crawlCounter >= 1000) throw("Crawl count exceeded.")
}
puppetLiharvest();
