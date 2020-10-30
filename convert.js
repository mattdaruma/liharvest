const fs = require('fs')
const cheerio = require('cheerio')

function cleanString(input){
    return input.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, " ").replace('"', "").trim()
}

let captures = fs.readdirSync('./captures')
for(let ind in captures){
    let capture = captures[ind]
    let captureContent = fs.readFileSync(`./captures/${capture}`, 'utf8')
    let $ = cheerio.load(captureContent)
    let csv = "Name,Title,Company,Tenure,Location,Profile\r\n";
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
    fs.writeFileSync(`./output/${capture.replace('.html', '.csv')}`, csv)
    console.log('capture success', capture)
}
