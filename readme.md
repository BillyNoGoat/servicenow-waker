## Servicenow Instance Waker
ServiceNow instance waker is a script to wake up your ServiceNow instance using Puppeteer/headless chrome to automate the process.


## Installation
`git clone` this repository and cd into the working directory and run `npm i` to install the dependencies.

## Config
in `config.js` fill out the username and password in the JSON such as:

```
module.exports = {
	users : [
	{
		"username": "user1@example.com",
		"password": "user1pass",
		"notifications": true
	},
	{
		"username": "user2@example.com",
		"password": "user2pass",
		"notifications": false
	}
	
	]
};
```

## Running
In the working directory run `node app.js` to run the script.

**Note** ServiceNow instances can take up to 5 minutes to wake up, be patient after you see `Waking instance...` in your console.
