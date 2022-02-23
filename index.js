const { firefox } = require('playwright-firefox');
const { send_log, send_notif } = require('./telegram.js');
const { fetch } = require('cross-fetch');

async function main() {
    console.log('App is running');
    (async() => {
        const browser = await firefox.launch({
            headless: true
        })
        const context = await browser.newContext()

        const page = await context.newPage()
        try {
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
            
            while (true) {
                try {
                    let response = await fetch('https://co.dfaapostille.ph/appointment/Account/Login');
                    console.log(response.status);
                    if (response.status == 200) {
                        await page.goto('https://co.dfaapostille.ph/appointment/Account/Login?ReturnUrl=%2Fappointment');
                        if (await page.isVisible('#announcement')) {
                            console.log('element found!');
                            break
                        } else {
                            console.log('element not found, reloading');
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
            while (isTrue) {
                for await (const i of arr) {
                    while (true) {
                        try {
                            console.log('check if element is visible');
                            if (await page.isHidden('#loading') && await page.isVisible('[name="Record.ProcessingSite"]')) {
                                await page.selectOption('#site', { 'index': i })
                                console.log('index selected');
                                await page.click('#stepSelectProcessingSiteNextBtn')
                                console.log('proceeding to next step');
                                break
                            }
                        } catch (e) {
                            console.log('Element missing, Reloading');
                            await page.goto('https://co.dfaapostille.ph/appointment/Account/Login');
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
                        if ((await dates.innerText()).includes('Not Available')) {
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
            process.exit(0)
        }
    })()
}

if (require.main === module) {
    main();
}
