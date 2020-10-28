const fs = require('fs');
const queryString = require('query-string');
const jsonfileData = require('./linkFetched.json') || [];
const puppeteer = require('puppeteer');
const scrapurl = 'https://handbook.unimelb.edu.au/search?page=1';
const scrapCourse = require('./scrapCourse');


async function start() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });

    const self = {

        parseResult: async (scrapurl) => {
            try {
                // const jsonData = jsonfileData
                // await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });
                // await page.waitForSelector('.list-2')
                let parsed = queryString.parse(page.url());
                let parsedUrl = Object.values(parsed)
                let currentPage = parseInt(parsedUrl[0]);

                let data = await page.$$eval('a[class="search-result-item__anchor"]', anchors => anchors.map(a => a.href));

                for (const courseLink of data) {
                    if (!jsonfileData.includes(courseLink)) {
                        jsonfileData.push(courseLink)
                        // console.log({ courseLink });
                        await scrapCourse.fetchCourseDetails(courseLink)
                    }
                    fs.writeFile('linkFetched.json', JSON.stringify(jsonfileData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log("JSON link is saved. Link: ", courseLink);
                    });
                }

                return currentPage;
            } catch (error) {
                console.log(error);
            }
        },
        getResults: async (nr) => {
            let results = 0;
            do {
                try {

                    let new_result = await self.parseResult();
                    results = new_result;

                    if (results < nr) {
                        let nextPageButton = await page.$('span[class="next"] > a[rel="next"]');
                        let courseLink = await nextPageButton.getProperty('href')
                        courseLink = await courseLink.jsonValue()
                        if (nextPageButton) {
                            // await nextPageButton.click();
                            await page.goto(courseLink, { waitUntil: 'domcontentloaded' });
                        } else {
                            break;
                        }

                    }
                } catch (error) {
                    console.log(error)
                }

            } while (results < nr);
            await browser.close();
            return results;
        }


    }

    // await self.initialize();
    let start = await self.getResults(348);
}
start()