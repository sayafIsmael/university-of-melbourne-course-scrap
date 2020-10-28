const fs = require('fs');
// const jsonfileData = require('./data.json') || [];

const puppeteer = require('puppeteer');
const scrapurl = 'https://handbook.unimelb.edu.au/search?page=1';
// const scrapCourse = require('./scrapCourse');


async function start() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const self = {

        parseResult: async () => {
            try {
                let results = [];
                // const jsonData = jsonfileData
                await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });
                // await page.waitForSelector('.list-2')

                let data = await page.$$eval('a[class="search-result-item__anchor"]', a => a.href);

                for (const course of data) {
                    const link = await course.getProperty('href');
                    const courseLink = await link.jsonValue();
                    // const courseName = await course.$eval('b', b => b.innerHTML);
                    results.push(courseLink)
                    console.log({ courseLink });
                    // await scrapCourse.fetchCourseDetails(courseLink)
                }

                await browser.close();
                return results;
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

                    if (nextPageButton) {
                        await nextPageButton.click();
                        await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });
                    } else {
                        break;
                    }

                }

            } while (results.length < nr);

            return results.slice(0, nr);
        }


    }

    // await self.initialize();
    let start = await self.parseResult();
}
start()