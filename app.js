const puppeteer = require('puppeteer');
const inform = require("./inform");
const config = require("./config");

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

run(0);

async function run(index) {
	const user = config.users[index];
	if(!user) return;
	const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
	const page = await browser.newPage();

	page.on('response', async (response) => {    
		if (response.url().includes("developer.servicenow.com/api/snc/v1/dev/instanceInfo")){
			const res = (await response.json()).result.instanceInfo;
			// if(res.wakeupInProgress) console.log(``);
			console.log(JSON.stringify(res, null, 2));
			const out = {
				name: res.name,
				release: res.release,
				timeRemaining: `${res.remainingInactivityDays} ${res.remainingInactivityDaysUnitStr}`,
				state: res.state,
				waking: res.wakeupInProgress
			}
			console.log(JSON.stringify(out));
			await browser.close();
			run(index + 1);
		} 
	}); 

	await page.goto('https://developer.service-now.com/dev.do');
	await page.waitFor(3000);
	await page.evaluate(
		() => {
			document.querySelector("body > dps-app").shadowRoot.querySelector("div > header > dps-navigation-header").shadowRoot.querySelector("header > div > div.dps-navigation-header-utility > ul > li:nth-child(2) > dps-login").shadowRoot.querySelector("div > dps-button").shadowRoot.querySelector("button > span").click();
		}
	);
	console.log('Logging as ' + user.username);
	await page.waitFor(3000);
	await page.waitForSelector("#username");
	await page.evaluate(
		(username) => {
			document.querySelector("#username").value = username;
		},
		user.username
	);
	await page.click("#usernameSubmitButton");
	await page.waitFor(3000);
	await page.waitForSelector("#password");
	await page.evaluate(
		(password) => {
			document.querySelector("#password").value = password;
			document.querySelector("#submitButton").click();
		},
		user.password
	);
	// await page.waitFor(20000);
	await page.waitForNavigation({waitUntil: 'networkidle0'});
	
	console.log("Logged into Developer Site");

}

