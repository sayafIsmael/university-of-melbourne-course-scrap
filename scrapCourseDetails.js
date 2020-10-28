const puppeteer = require('puppeteer');
const scrapCourseDetails = require('./scrapCourseDetails');
const scrapurl = "https://handbook.unimelb.edu.au/2020/courses/gd-enrslaw/course-structure";

// module.exports.fetchCourseDetails = async (scrapurl, callback) => {
(async () => {

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });
        // await page.waitForSelector(' ')

        let course = await page.$('table[class="zebra"] > tbody');
        let courseDetails = await course.$$('tr')

        if (courseDetails.length) {
            for (const detail of courseDetails) {
                const value = await detail.$$eval('td', tds => tds.map(td => td.textContent))
                console.log(value)
            }
        }


        await browser.close()
        return

    } catch (error) {
        console.log(error)
    }
})();
// }

let model = {
    "unitType": "Common Units (2 units)",
    "creditPoints": "20 cp",
    "description": "",
    "unitList": [
        {
            "code": "CUC107",
            "title": "CUC107 - Cultural Intelligence and Capability",
            "year": "2020",
            "hours": null,
            "creditPoints": "10",
            "semester": [
                {
                    "year": "2020",
                    "semester": "Semester 1",
                    "attendanceMode": "Internal",
                    "location": "Alice Springs Campus",
                    "learningMethod": "OLR"
                }
            ],
            "sector": "Higher Education",
            "discipline": "Indigenous Studies",
            "prerequisites": "NA",
            "incompatible": "NA",
            "assumedKnowledge": "NA",
            "description": ""
        }
    ]
}