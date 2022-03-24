const { firefox } = require('playwright-firefox');
const { send_log, send_notif } = require('./telegram.js');
const { fetch } = require('cross-fetch');

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
        })
        const context = await browser.newContext()

        const page = await context.newPage()
        try {
            while (true) {
                try {
                    let response = await fetch('https://co.dfaapostille.ph/appointment/Account/Login');
                    console.log('Page response:', response.status);
                    if (response.status == 200) {
                        await page.goto('https://co.dfaapostille.ph/appointment/Account/Login?ReturnUrl=%2Fappointment');
                        if (await page.isVisible('#announcement')) {
                            console.log('PART 1: Element found!');
                            break
                        } else {
                            console.log('element not found, reloading');
                            await page.goto('https://co.dfaapostille.ph/appointment/Account/Login?ReturnUrl=%2Fappointment');
                        }
                    } else {
                        console.log('ERROR 403 Forbidden, reloading');
                        await page.goto('https://co.dfaapostille.ph/appointment/Account/Login?ReturnUrl=%2Fappointment');
                    }
                } catch (e) {
                    await page.goto('https://co.dfaapostille.ph/appointment/Account/Login?ReturnUrl=%2Fappointment');
                }
            }
            
            await page.click('div[class="container"] button:has-text("Close")')

            await page.locator('#Email').fill('aziz.saricula+1@gmail.com')
            await page.locator('#Password').fill('Anon123s.')

            await page.click('button:has-text("LOGIN")')
            await page.click('#declaration-agree')
            await page.click('#terms-and-conditions-agree')

            //Home page
            await page.waitForTimeout(1000)
            await page.click('#show-document-owner')


            await page.waitForTimeout(1000);
            isTrue = true
            let arr = [0, 1, 4]
            
            var countdown = 20 * 60 * 1000;
            var timerId = setInterval(async function() {
                countdown -= 1000;
                var min = Math.floor(countdown / (60 * 1000));
                var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);
                if (countdown <= 0) {
                    clearInterval(timerId)
                    await page.click('.float-right')
                    //send_notif(`Checker has reached it's time limit, app will automatically restart`)
                    throw Error(`Checker has reached it's time limit, app will automatically restart`)
                }
            }, 1000);
            
            while (isTrue) {
                for await (const i of arr) {
                    while (true) {
                        try {
                            if (await page.isHidden('#loading')) {
                                console.log('PART 2: Element Found!');
                                await page.selectOption('#site', { 'index': i })
//                                 var branch_name = await page.$eval('#site', sel => sel.options[sel.options.selectedIndex].textContent)
//                                 console.log(`Check appointment status in ${branch_name}\n`);
                                await page.click('#stepSelectProcessingSiteNextBtn')
                                console.log('proceeding to next step');
                                break
                            } else {
                                console.log('element is missing, reloading');
                                await page.reload()
                            }
                        } catch (e) {
                            console.log('catch: Element missing, Reloading');
                            await page.reload()
                            //await page.goto('https://co.dfaapostille.ph/appointment/Home/Index')
                        }
                    }
                    //Document owner   
                    await page.locator('#Record_FirstName').fill('Datu Abdulaziz')
                    await page.locator('#Record_MiddleName').fill('Matabalao')
                    await page.locator('#Record_LastName').fill('Saricula')
                    await page.locator('#Record_DateOfBirth').fill('2000-02-25') // birthdate format (yyyy-mm-dd)
                    await page.locator('#Record_ContactNumber').fill('9954200802')
                    await page.locator('#Record_CountryDestination').selectOption({ 'value': 'Kuwait (KWT)' })

                    await page.locator('#documentsSelectionBtn').click()
                    await page.locator('#nbiClearance').check()
                    await page.locator('#qtyNbiClearanceRegular').fill('1')
                    await page.locator('#selectDocumentsBtn').click()

                    await page.locator('#stepOneNextBtn').click()

                    const available_date = await page.$$('span[class="fc-title"]');
                    var branch_name = await page.$eval("#siteAndNameAddress", branchname => branchname.textContent);

                    available_date.forEach(async dates => {
                        if ((await dates.innerText()).includes('Not Avaimlable')) {
                            console.log(`${await dates.innerText()} in ${branch_name}`)
                        } else {
                            console.log(`APPOINTMENT FOUND IN ${branch_name}`)
                            send_notif(`APPOINTMENT FOUND IN ${branch_name}`)
                        }
                    });
                    await page.waitForTimeout(200)
                    await page.click('#backToStepOne');
                    await page.click('#stepOneBackBtn');

                }
            }
        } catch (e) {
            console.log(e);
            send_notif(e)
        } finally {
            await context.close()
            await browser.close()
            process.exit(1)
        }
    })()
}

if (require.main === module) {
    main();
}
