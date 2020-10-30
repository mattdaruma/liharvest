const puppeteer = require('puppeteer')
const fs = require('fs')
let browser = puppeteer.launch({
    headless: false,
    userDataDir: './user-data',
    defaultViewport: null
    })