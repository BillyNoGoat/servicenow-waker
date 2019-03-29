const puppeteer = require("puppeteer");
const config = require("./config");

const username = config.username;
const password = config.password;

async function run() {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  await page.goto("https://developer.servicenow.com/app.do#!/instance");
  await page.waitForSelector("#username");
  await page.evaluate(
    (user, pass) => {
      document.querySelector("#username").value = user;
      document.querySelector("#password").value = pass;
    },
    username,
    password
  );

  await page.click("#submitButton");
  //Wait for button
  await page.waitForSelector("#instanceWakeUpBtn");
  await page.waitForSelector("#instance_detail div.col-xs-8 p");

  const instanceBefore = await getInstanceDetails(page);
  console.log(instanceBefore);

  try {
    await page.click("#instanceWakeUpBtn");
  } catch (e) {
    browser.close();
    return console.log("Instance is already awake! Exiting....");
  }

  console.log("Waking instance...");

  await page.waitFor(
    () =>
      document.querySelector("#instance_detail > div.col-xs-8 p span")
        .innerText == "Online",
    { timeout: 300000 } // 5 minute timeout
  );

  console.log("Instance awake");

  const instanceAfter = await getInstanceDetails(page);

  console.log(instanceAfter);
  browser.close();
}

run();

// Takes a page, returns the instance details from it. URL: https://developer.servicenow.com/app.do#!/instance
async function getInstanceDetails(instancePage) {
  return Promise.resolve(
    await instancePage.evaluate(() => {
      var instanceDetail = Array.from(
        document.querySelectorAll("#instance_detail div.col-xs-8 p")
      ).slice(0, 4);
      const instance = {
        status: instanceDetail[0].innerText,
        url: instanceDetail[1].querySelector("a").innerText,
        build: instanceDetail[2].querySelector("#shortRelease").innerText,
        timeRemaining: instanceDetail[3].querySelector("span:last-child")
          .innerText
      };
      return instance;
    })
  );
}
