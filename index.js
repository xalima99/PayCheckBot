const puppeteer = require("puppeteer");
const {sendMailSuccess, sendMailFail, sendMailParsingErr} = require('./test_mail')


const mainFunc = async () => {
    //launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  const page = await browser.newPage();
  try {
    //set user agent
    const userAgent = await page.evaluate(() => navigator.userAgent);
    page.setUserAgent(userAgent);

    await page.goto(`https://supremeboost.com/products/followers-instagram`, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    await page.waitForSelector("#SingleOptionSelector-0")
    await page.waitForSelector("input[type=text]");

    await delay(2000);
    //fills insta handle
    await page.type("input[type=text]", "hello");

    const loginButton = await page.$(".btn.btn-danger.btn-large")
    await loginButton.click();

    //Upselling popup
    await page.waitForSelector("#upsellAddToCart");
    const next1 = await page.$("#upsellAddToCart")
    await next1.click();
    await delay(2000);

    await next1.click({ waitUntil: 'load',
    // Remove the timeout
    timeout: 0});

    await page.waitForSelector(".btn.cart__checkout");
    const finalise = await page.$(".btn.cart__checkout")
    await finalise.click({ waitUntil: "networkidle2",
    timeout: 0});
    await delay(10000);

    //fill the Form
    await page.waitForSelector("input[type=email]");
    await page.waitForSelector("input[name=firstName]");
    await page.waitForSelector("input[name=lastName]");
    await page.waitForSelector("#checkout_billing_address_address1");
    await page.waitForSelector("#checkout_billing_address_address2"); 
    await page.waitForSelector("#checkout_billing_address_zip"); 
    await page.waitForSelector("#checkout_billing_address_city"); 
    await page.waitForSelector("#checkout_billing_address_phone"); 

    const page1 = await fillForm(page)
    

    await delay(1000);
    await page1.waitForSelector("#continue_button");
    const finalise1 = await page1.$("#continue_button")
    await finalise1.click({ waitUntil: "networkidle2",
    timeout: 0});
 
    //check if paypal button then click
    const page2 = await checkPaypal(page1)
    await delay(2000)
    const check = await checkOutFormDisplays(page2, browser)

    if(check){
        console.log('FOUND CARD FIELD')
        await browser.close();
        return true
    } else {
        console.log('DID NOT FIND CARD FIELD')
        await browser.close();
        return false
    }
    
  } catch (error) {
   
    console.error(error);
    sendMailParsingErr('Main function crashed, check form filling')
    browser.close();
  }
};

const delay = (time) => {
    //simple helper to pause code execution
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }


const checkOutFormDisplays = async (page, browser) => {
    await delay(10000)
    if (await page.$(".paypal-overlay-context-popup.paypal-checkout-overlay") != null){
        //if overlay (to be tested since the overlay method of payment appears randomly)
        return true
    }
    const pages = await browser.pages(); // get all open pages by the browser
    try {
        const popup = pages[pages.length - 1]; // the popup should be the last page opened
        if (pages.length > 1){
            //if true then iframe appears
            console.log("SHAMBALA")
            await popup.waitForSelector('[title=PayPal]')
            await delay(5000)
            //search for credit card input in iframe
            const frame = await popup.frames().filter(f => f.name().includes('paypal'))
            await delay(5000)
            await frame[frame.length - 1].waitForSelector('#credit-card-number');
            const card = await frame[frame.length - 1].$('#credit-card-number');
            const card1 = await frame[frame.length - 1].$('#cardNumber');
            
            if (await frame[frame.length - 1].$(".paypal-overlay-context-popup.paypal-checkout-overlay") != null){
                //if overlay (to be tested since the overlay method of payment appears randomly)
                return true
            }
        
            if (card != null){
                console.log('CARD up')
                await card.click();
                return true

            } else if (card1 != null) {
                console.log('Card Down')
                await card1.click();
                return true
            } else {
                console.log('all null')
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        return false
    }
    
}
 
const checkPaypal = async (page) => {
    //get the iframe then extracts the 'Carte Bancaire' button and clicks on it and return the page
    await page.waitForSelector('iframe[title=PayPal]')
    const frame = await page.frames().find(f => f.name().includes('paypal'))

    const clickLogin = await frame.$('.paypal-button.paypal-button-number-1.paypal-button-layout-vertical')
   
    await clickLogin.click();
    return page
}

const fillForm =  async (page) => {
    //fills the form then returns the page
    await page.type("input[type=email]", "supremetest@gmail.com");
    await delay(1500);
    await page.type("input[name=firstName]", "Amadou");
    await page.type("input[name=lastName]", "Fall");
    await delay(1500);
    await page.type("input[id=checkout_billing_address_address1]", "11 Rue 5 forges les eaux");
    await delay(1500);
    await page.type("input[id=checkout_billing_address_address2]", "sergy pontoise");
    await delay(1500);
    await page.type("input[id=checkout_billing_address_zip]", "75001");
    await page.type("input[id=checkout_billing_address_city]", "Paris");
    await delay(2000);

    await page.type("#checkout_billing_address_phone", "00");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "33");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "7");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "61");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "95");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "78");
    await delay(1000);
    await page.type("#checkout_billing_address_phone", "27");

    return page
}

const looper = async () => {
    //ENTRY POINT calls the main function for a specified time loop
    //if any error during check send Error Mail
    //if no errors send success mail
    for (let i = 0; i <= 5; i++){
        await delay(2000);
        is_payment_working =  await mainFunc()
        await delay(2000);
        if (!is_payment_working){
            sendMailFail()
            break;
        } else{
            sendMailSuccess(`Check N${i} done`)
        }
    }
}

module.exports = looper