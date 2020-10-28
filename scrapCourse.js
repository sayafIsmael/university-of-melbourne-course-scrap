const fs = require('fs')
const puppeteer = require('puppeteer');
const uid = require('uid')
const scrapCourseDetails = require('./scrapCourseDetails');
const scrapurl = "https://handbook.unimelb.edu.au/2020/courses/b-arts";
const jsonfileData = require('./data.json') || [];

module.exports.fetchCourseDetails = async (scrapurl) => {
// (async () => {

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(scrapurl, { waitUntil: 'domcontentloaded' });

        let courseCode = "NA", courseName = "NA", cricosCode = "NA", courseUnits = [], courseStudyModes = "NA", courseYear = "NA", courseLevel = "NA", totalCreditPoints = "NA", location = "NA", prerequisites = "NA"
        let courseLink = scrapurl
        let courseId = "UNIMELB-" + uid(5)

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
                    courseLevel = value
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

            courseUnits = await scrapCourseDetails.fetchCourseDetails(`${scrapurl}/course-structure`, location, courseLevel)

            let courseData = {
                courseId,
                courseName,
                courseCode,
                cricosCode,
                studyArea: "NA",
                courseLevel,
                courseStudyModes,
                totalCreditPoints,
                courseUnits,
                isAvailableOnline: "NA",
                campuses:[
                    {
                        type: "Offline",
                        campusName: location,
                        postalAddress: null,
                        state: null,
                        geolocation: {
                            lat: null,
                            lan: null
                        }
                    },
                ],
                courseFees:[],
                institutionSpecificData:{},
                courseLink
            }

            if (!jsonfileData.includes(courseData)) {
                jsonfileData.push(courseData)
                fs.writeFile('data.json', JSON.stringify(jsonfileData), (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log("JSON data is saved. Data: ",courseData);
                });
            }
        }

        await browser.close()
        return

    } catch (error) {
        console.log(error)
    }
// })();
}

