const fs = require('fs');
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

                await browser.close();
                return data;
            } catch (error) {
                console.log(error);
            }
        },
        getResults: async (nr) => {
            let results = [];
            do {
                let new_results = await self.parseResult();

                results = [...results, ...new_results];

                if (results.length < nr) {
                    let nextPageButton = await page.$('span[class="next"] > a[rel="next"]');
                    let courseLink = await nextPageButton.getProperty('href')
                    console.log(courseLink)
                    if (nextPageButton) {
                        await nextPageButton.click();
                        await page.goto(courseLink, { waitUntil: 'domcontentloaded' });
                    } else {
                        break;
                    }

                }

            } while (results.length < nr);

            return results.slice(0, nr);
        }


    }

    // await self.initialize();
    let start = await self.getResults(348);
}
start()