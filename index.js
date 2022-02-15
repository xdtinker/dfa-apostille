const { chromium } = require('playwright');
const { send_log, send_notif } = require('./telegram.js');

isTrue = true
async function main() {
    (async() => {
        const browser = await chromium.launch({
            headless: true
        })
        const context = await browser.newContext()

        const page = await context.newPage()
        try {
            exit_condition = 0
            while (isTrue) {
                if (exit_condition >= 50) throw Error("Time limit Exceeded, Dyno will restart \nUse /start command to restart task")
                exit_condition += 1
                await page.goto('https://co.dfaapostille.ph/appointment/Account/Login', { waitUntil: 'domcontentloaded' })

                await page.waitForTimeout(1000)
                await page.click('#announcement >> text=Close')

                await page.locator('#Email').fill('aziz.saricula@gmail.com')
                await page.locator('#Password').fill('Anon123s.')

                await page.click('text=LOGIN')
                await page.click('#declaration-agree')
                await page.click('#terms-and-conditions-agree')

                //Home page
                await page.waitForTimeout(1000)
                await page.click('#show-document-owner')

                await page.waitForTimeout(1000)
                await page.selectOption('#site', { 'index': 0 })
                await page.click('#stepSelectProcessingSiteNextBtn')


                //Document owner   
                await page.locator(`#Record_FirstName`).fill('Datu Abdulaziz')
                await page.locator('#Record_MiddleName').fill('Matabalao')
                await page.locator('#Record_LastName').fill('Saricula')
                await page.locator('#Record_DateOfBirth').fill('2000-02-25') // birthdate format (yyyy-mm-dd)
                await page.locator('#Record_ContactNumber').fill('9954200802')
                await page.locator('#Record_CountryDestination').selectOption({ 'value': 'Kuwait (KWT)' })

                await page.locator('#documentsSelectionBtn').click()
                await page.locator('#nbiClearance').click()
                await page.locator('#qtyNbiClearanceRegular').fill('1')
                await page.locator('#selectDocumentsBtn').click()

                await page.locator('#stepOneNextBtn').click()


                const available_date = await page.$$('div[class="fc-content"]');

                for await (const dates of available_date) {
                    if (await dates.innerText() == 'Not Available') {
                        // console.log(await dates.innerText());
                        console.log('NO APPOINTMENT FOUND IN ASEANA')
                    } else {
                        send_notif('APPOINTMENT FOUND IN IN ASEANA')
                        isTrue = false
                        break
                    }
                }
                await page.click('.float-right')
            }
        } catch (e) {
            console.log(e);
            send_notif(e.message)
        } finally {
            await context.close()
            await browser.close()
        }
    })()
}

function stop() {
    isTrue = false
}

module.exports = { stop, main }
