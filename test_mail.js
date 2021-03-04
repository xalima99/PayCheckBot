const API_KEY = '<API-KEY-HERE>';
const DOMAIN = 'liverek.com';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

function formatAMPM(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}





const sendMailFail = async () => {
    try {
  
        const data = {
            from: 'supremebootPaypalChecker <me@liverek.com>',
            to: 'amadoufalldev@gmail.com, xalima99@gmail.com',
            subject: 'PAYPAL ACCOUNTS ERROR',
            text: `There is a paypal account that is not working, please deactivate it ! last check was made at ${formatAMPM(new Date)}`
        };
        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
    } catch (error) {
        console.log(error)
    }
}

const sendMailSuccess = async (title) => {
    try {
        const data = {
            from: 'supremebootPaypalChecker <me@liverek.com>',
            to: 'amadoufalldev@gmail.com, xalima99@gmail.com',
            subject: title,
            text: `parsing Done, accounts are working, last check was made at ${formatAMPM(new Date)}`
        };
        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
    } catch (error) {
        console.log(error)
    }
}

const sendMailParsingErr = async (title) => {
    try {
        const data = {
            from: 'supremebootPaypalChecker <me@liverek.com>',
            to: 'amadoufalldev@gmail.com, xalima99@gmail.com',
            subject: title,
            text: `parsing Err, last check was made at ${formatAMPM(new Date)}`
        };
        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
    } catch (error) {
        console.log(error)
    }
}

module.exports = {sendMailFail, sendMailSuccess, sendMailParsingErr}