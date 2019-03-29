## Servicenow Instance Waker
ServiceNow instance waker is a script to wake up your ServiceNow instance using Puppeteer/headless chrome to automate the process.

Currently it relies on having the "Wake instance" overlay on your instance's page. If this is not present, your instance is considered "online" and the script won't proceed:

![Wake instance](https://i.imgur.com/oOXNPcm.png)

## Installation
`git clone` this repository and cd into the working directory and run `npm i` to install the dependencies.

## Config
in `config.js` fill out the username and password in the JSON such as:

```
module.exports = {
  username: "MyUsername@username.com",
  password: "MyPassword123"
}
```

## Running
In the working directory run `node app.js` to run the script.

**Note** ServiceNow instances can take up to 5 minutes to wake up, be patient after you see `Waking instance...` in your console.
