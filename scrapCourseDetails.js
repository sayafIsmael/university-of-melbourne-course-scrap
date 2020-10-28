const puppeteer = require('puppeteer');
const scrapurl = "https://handbook.unimelb.edu.au/2020/courses/gd-enrslaw/course-structure";

module.exports.fetchCourseDetails = async (scrapurl, location, sector) => {
    // (async () => {

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });
        // await page.waitForSelector(' ')

        let course = await page.$('table[class="zebra"] > tbody');
        let courseDetails = await course.$$('tr')
        let units = []

        if (courseDetails.length) {
            for (const detail of courseDetails) {
                const value = await detail.$$eval('td', tds => tds.map(td => td.textContent))
                let unit = new unitModel(value[3], value[0], value[1], value[2], location, sector)
                units.push(unit)
                // console.log(value)
            }
        }


        await browser.close()
        // console.log(units)
        return units

    } catch (error) {
        console.log(error)
    }
    // })();
}

const unitModel = function (creditPoints, code, title, semester, location, sector) {
    this.unitType = "NA",
        this.creditPoints = creditPoints,
        this.description = "",
        this.unitList = [
            {
                code,
                title,
                year: "2020",
                hours: null,
                creditPoints,
                semester: [
                    {
                        year: "2020",
                        semester,
                        attendanceMode: "NA",
                        location,
                        learningMethod: "NA"
                    }
                ],
                sector,
                discipline: "NA",
                prerequisites: "NA",
                incompatible: "NA",
                assumedKnowledge: "NA",
                description: ""
            }
        ]
}