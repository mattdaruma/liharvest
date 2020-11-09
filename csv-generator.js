const fs = require('fs')

function csvGenerator(fileName){
    let lines = []
    let headers = []
    let filePath = `./csvs/${fileName}.csv`
    if(!fs.existsSync("./csvs")) fs.mkdirSync('./csvs')
    let readFile = ()=>{
        if(fs.existsSync(filePath)){
            let content = fs.readFileSync(filePath, "utf8")
            lines = content.split("\r\n")
            headers = lines.shift().split(',')
            while(lines[0]=="\r\n") lines.shift()
        }
        else{
            fs.writeFileSync(filePath, "", "utf8")
            lines = []
            haeders = []
        }
    }
    let writeFile = ()=>{
        let lineContent = lines.join('\r\n')
        lineContent = lineContent.substr(0, lineContent.length - 4)
        let contents = `${headers.join(',')}\r\n${lineContent}`
        fs.writeFileSync(filePath, contents, 'utf8')
    }
    this.addLine = (line)=>{
        readFile()
        lines.push(line)
        writeFile()
    }
    this.setHeaders = (headerArray)=>{
        readFile()
        headers = headerArray
        writeFile()
    }
}
module.exports = csvGenerator