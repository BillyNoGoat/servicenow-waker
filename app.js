const puppeteer = require("puppeteer");
const config = require("./config");
const inform = require("./inform");

const username = config.username;
const password = config.password;

async function run() {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  await page.goto("https://developer.servicenow.com/app.do#!/instance");
  console.log("Loading instance page...");
  await page.waitForSelector("#username");
  await page.evaluate(
    (user, pass) => {
      document.querySelector("#username").value = user;
      document.querySelector("#password").value = pass;
    },
    username,
    password
  );
  console.log("Set pass");
  await page.waitForSelector("#submitButton");
  //await page.click("#submitButton");
  //submitButton is now a hidden button without navigating the page, no need to
  //show it - just evaluate .click();
  await page.evaluate(() => {
    document.querySelector("#submitButton").click();
  });

  console.log("Logging in...");
  loginResponse = await page.waitForResponse(res => {
    return (
      res.status() === 200 &&
      res.url() === "https://developer.servicenow.com/app.do"
    );
  });
  console.log("Logged in.");
  await page.goto("https://developer.servicenow.com/app.do#!/instance");
  console.log("Navigating...");
  //Wait for button
  try {
    await page.waitForSelector("#instanceWakeUpBtn");
    await page.waitForSelector("#instance_detail div.col-xs-8 p");
  } catch (e) {
    await browser.close();
    console.log("Unable to wake instance, exiting...");
    console.log(e);
    inform.informFinish(instanceBefore, {
      awoken: false,
      msg: "❌ Unknown error trying to wake instance!",
      err: e
    });
    return;
    //console.log(e);
  }

  const instanceBefore = await getInstanceDetails(page);
  console.log(instanceBefore);

  try {
    await page.click("#instanceWakeUpBtn");
  } catch (e) {
    inform.informFinish(instanceBefore, {
      awoken: false,
      msg: "🕒 Instance is already awake!",
      err: null
    });
    browser.close();
    return console.log("Instance is already awake! Exiting....");
  }

  console.log("Waking instance, this may take a while...");

  await page.waitFor(
    () =>
      document.querySelector("#instance_detail > div.col-xs-8 p span")
        .innerText == "Online",
    { timeout: 300000 } // 5 minute timeout
  );

  console.log("Instance awake");
  const instanceAfter = await getInstanceDetails(page);
  console.log(instanceAfter);
  inform.informFinish(instanceAfter, {
    awoken: true,
    msg: "✅ Instance awoken successfully.",
    err: null
  });
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
