const puppeteer = require('puppeteer');
const uid = require('uid')
// const scrapCourseDetails = require('./scrapCourseDetails');
const scrapurl = "https://handbook.unimelb.edu.au/2020/courses/b-arts";

// module.exports.fetchCourseDetails = async (scrapurl = "https://handbook.unimelb.edu.au/2020/courses/b-arts") => {
(async () => {

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });

        let courseName, cricosCode, courseStudyModes, courseYear, coordinatingUnit, level, totalCreditPoints, contact, courseDescription, term, location, prerequisites = "NA"
        let courseLink = scrapurl
        let courseCode = "UNIMELB-" + uid(5)

        let course = await page.$('div[class="course__overview-box"] > table > tbody');
        let courseDetails = await course.$$('tr')

        // console.log(courseDetails.length > 4)

        if (courseDetails.length > 4) {
            for (const detail of courseDetails) {
                const key = await detail.$eval('th', th => th.innerHTML)
                const value = await detail.$eval('td', td => td.innerHTML)

                if (key.includes('Award title')) {
                    courseName = value;
                }
                if (key.includes('Year')) {
                    let splitString = value.replace(/<[^>]*>/g, '');
                    splitString = splitString.split('—')
                    courseYear = splitString[0].trim()
                    location = splitString[1]
                }
                if (key.includes('CRICOS code')) {
                    cricosCode = value
                }
                if (key.includes('Study level')) {
                    level = value
                }
                if (key.includes('Credit points')) {
                    totalCreditPoints = value.replace("credit points", "").trim()
                }
                if (key.includes('Duration')) {
                    let studyModes = []
                    let data = [value]
                    if (value.includes('or')) {
                        data = value.split('or')
                    }
                    data.map(str => {
                        if (str.includes("full-time")) {
                            duration = str.replace("full-time", "").trim()
                            studyModes.push({ studyMode: "Full-time", duration })
                        }
                        if (str.includes("part-time")) {
                            duration = str.replace(" part-time", "").trim()
                            studyModes.push({ studyMode: "Part-time", duration })
                        }
                    })
                    courseStudyModes = studyModes
                }
            }
        }


        console.log(courseStudyModes)
        await browser.close()
        return

    } catch (error) {
        console.log(error)
    }
})();
// }