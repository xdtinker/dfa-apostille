const { firefox } = require('playwright-firefox');
const { send_log, send_notif } = require('./telegram.js');

var OK = '\x1b[33m%s\x1b[0m';
var BAD = '\x1b[31m%s\x1b[0m';

const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
];

async function main() {
    console.log('App is running');
    (async() => {
        const browser = await firefox.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            args: args,
            ignoreDefaultArgs: ['--enable-automation']
        })
        const context = await browser.newContext()

        const page = await context.newPage()
        try {
            var countdown = 60 * 60 * 1000;
            var timerId = setInterval(function() {
                countdown -= 1000;
                var min = Math.floor(countdown / (60 * 1000));
                var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);
                if (countdown <= 0) {
                    clearInterval(timerId)
                    send_notif(`Checker has reached it's time limit, app will automatically restart`)
                    throw Error(`Checker has reached it's time limit, app will automatically restart`)
                }
            }, 1000);

            await page.goto('https://co.dfaapostille.ph/appointment/Account/Login', { waitUntil: 'domcontentloaded' });
            // await page.goto('https://co.dfaapostille.ph/dfa', { waitUntil: 'domcontentloaded' })

            await page.waitForTimeout(1000)

            // await page.click('text=SCHEDULE AN APPOINTMENT')

            await page.click('button[data-dismiss="modal"] >> nth=1')

            await page.locator('#Email').fill('aziz.saricula+1@gmail.com')
            await page.locator('#Password').fill('Anon123s.')

            await page.click('text=LOGIN')
            await page.click('#declaration-agree')
            await page.click('#terms-and-conditions-agree')

            //Home page
            await page.waitForTimeout(1000)
            await page.click('text=DOCUMENT OWNER')

            await page.waitForTimeout(1000);
            isTrue = true
            let arr = [0, 1, 4]
            while (isTrue) {
                for await (const i of arr) {
                    await page.selectOption('#site', { 'index': i })
                    await page.click('#stepSelectProcessingSiteNextBtn')

                    //Document owner   
                    await page.locator('#Record_FirstName').fill('Datu Abdulaziz')
                    await page.locator('#Record_MiddleName').fill('Matabalao')
                    await page.locator('#Record_LastName').fill('Saricula')
                    await page.locator('#Record_DateOfBirth').fill('2000-02-25') // birthdate format (yyyy-mm-dd)
                    await page.locator('#Record_ContactNumber').fill('9954200802')
                    await page.locator('#Record_CountryDestination').selectOption({ 'value': 'Kuwait (KWT)' })

                    await page.locator('#documentsSelectionBtn').click()
                    await page.waitForTimeout(1000);
                    await page.locator('#nbiClearance').check()
                    await page.locator('#qtyNbiClearanceRegular').fill('1')
                    await page.locator('#selectDocumentsBtn').click()

                    await page.locator('#stepOneNextBtn').click()

                    await page.waitForTimeout(1000)

                    const available_date = await page.$$('span[class="fc-title"]');
                    var branch_name = await page.$eval("#siteAndNameAddress", branchname => branchname.textContent)
                    for await (const dates of available_date) {
                        if (await dates.innerText() == 'Not Available') {
                            console.log(BAD, `NO APPOINTMENT FOUND IN ${branch_name}`)
                        } else {
                            console.log(OK, `APPOINTMENT FOUND IN ${branch_name}`)
                            send_notif(`APPOINTMENT FOUND IN ${branch_name}`)

                        }
                    }
                    await page.click('#backToStepOne')
                    await page.click('#stepOneBackBtn')
                }
            }
        } catch (e) {
            console.log(e);
            send_notif(e)
        } finally {
            await context.close()
            await browser.close()
            process.exit(0)
        }
    })()
}

if (require.main === module) {
    main();
}
