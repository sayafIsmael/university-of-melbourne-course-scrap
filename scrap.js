const fs = require('fs');
const uid = require('uid')
const queryString = require('query-string');
const jsonLinkData = require('./linkFetched.json') || [];
const jsonCourseData = require('./data.json') || [];

const puppeteer = require('puppeteer');
const scrapurl = 'https://handbook.unimelb.edu.au/search?page=1';
const scrapCourse = require('./scrapCourse');


async function start() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });

    const self = {

        parseResult: async () => {
            try {
                let parsed = queryString.parse(page.url());
                let parsedUrl = Object.values(parsed)
                let currentPage = parseInt(parsedUrl[0]);

                let data = await page.$$('a[class="search-result-item__anchor"]');

                for (const course of data) {
                    let courseLink = await course.getProperty('href')
                    courseLink = await courseLink.jsonValue()
                    if (!jsonLinkData.includes(courseLink)) {
                        // console.log({ courseLink });
                        let courseSaved = await scrapCourse.fetchCourseDetails(courseLink)

                        if(!courseSaved){
                            let courseId = "UNIMELB-" + uid(5)
                            let courseName = await course.$eval('div[class="search-result-item__name"] > h3', h3 => h3.textContent)
                            let courseCode = await course.$eval('div[class="search-result-item__name"] > span', span => span.textContent)
                            let levelAndCredit = await course.$eval('div[class="search-result-item__meta-secondary"] > p', p => p.textContent)
                            let courseLevel = "NA"
                            let totalCreditPoints = "NA"
                            let level = levelAndCredit.split(',')
                            if(level.length > 1){
                                if(level[0].includes('level')){
                                    courseLevel = level[0].trim()
                                }
                                if(level[1].includes('credit points')){
                                    totalCreditPoints = level[1].trim().replace('credit points','')
                                }
                            }else{
                                totalCreditPoints = level[0].trim().replace('credit points','')
                            }

                            let courseData = {
                                courseId,
                                courseName,
                                courseCode,
                                cricosCode: "NA",
                                studyArea: "NA",
                                courseLevel,
                                courseStudyModes: "NA",
                                totalCreditPoints,
                                courseUnits:[],
                                isAvailableOnline: true,
                                campuses: [],
                                courseFees: [],
                                institutionSpecificData: {},
                                courseLink
                            }

                            if (!jsonCourseData.includes(courseData)) {
                                jsonCourseData.push(courseData)
                                fs.writeFile('data.json', JSON.stringify(jsonCourseData), (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log("Course data is saved. ", courseData);
                                });
                            }
                        }
                        jsonLinkData.push(courseLink)
                        fs.writeFile('linkFetched.json', JSON.stringify(jsonLinkData), (err) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log("Course link is saved. ", courseLink);
                        });
                    }
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

    let start = await self.getResults(348);
    // self.parseResult()
}
start()