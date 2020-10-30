const puppeteer = require('puppeteer')
const fs = require('fs');
const { finished } = require('stream');
function captureResult(counter, content){
    console.log(`capture ${counter}`)
    let countString = counter.toString()
    while(countString.length < 4) { countString = `0${countString}` }
    fs.writeFileSync(`./captures/${countString}-page.html`, content)
}


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
async function puppetLiharvest(){
    let browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user-data',
        defaultViewport: null
       })
    let page = await browser.newPage()
    await page.goto('https://www.linkedin.com/sales/search/people',{waitUntil: 'networkidle0'})
    await page.type('#global-typeahead-search-input', "manager")
    await page.click('.global-typeahead__search-button')
    await page.waitForSelector('#results')
    let finishedCrawling = false
    let crawlCounter = 0
    while( !finishedCrawling && crawlCounter < 1000 ) {
        crawlCounter++
        console.log(`crawl-${crawlCounter}`)
        try{
            await page.evaluate(async ()=>{
                await new Promise((resolve, reject)=>{
                    let counter = 0;
                    let timer = setInterval(()=>{
                        counter++;
                        window.scrollTo(0, document.body.scrollHeight)
                        let prev = document.getElementsByClassName('search-results__pagination-next-button')
                        let next = document.getElementsByClassName('search-results__pagination-next-button')
                        console.log(`scroll-${counter}`, `next-${next.length}`, `prev-${prev.length}`)
                        if(next.length > 0 || prev.length > 0){
                            clearInterval(timer)
                            resolve()
                        }else{
                            if(counter >= 10){
                                reject()
                            }
                        }
                    }, 1000)
                })
            })
        }catch(err){
            throw("Scrolling loop never completed.")
        }

        let pageContent = await page.content()
        captureResult(crawlCounter, pageContent)
        console.log('got results')
        try{
            await page.click('.search-results__pagination-next-button')
            await new Promise((resolve, reject)=>{
                setTimeout(() => {
                    resolve()
                }, 1000);
            })
            await page.waitForSelector('#results')
        }catch(err){
            finishedCrawling = true;
            throw("Crawling ended.")
        }
    }
    if(crawlCounter >= 1000) throw("Crawl count exceeded.")
}
puppetLiharvest();
