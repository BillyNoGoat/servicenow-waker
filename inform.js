const notifier = require("node-notifier");
const path = require("path");
//const config = require("./config");

function informFinish(instance, notify, finishData) {
  if (notify) {
    const instanceName = instance.url.match(/\/\/(.+?)\./)[1];

    notifier.notify({
      title: instanceName,
      message: createNotifMsg(instance, finishData),
      icon: path.join(__dirname, "servicenow.png")
    });
  }
}

function createNotifMsg(instance, finishData) {
  const message = `${finishData.msg}\nStatus: ${instance.status}\nTime remaining: ${instance.timeRemaining}`;
  finishData.err ? (message += `\n${finishData.err}`) : ""; // If error exists, add it
  return message;
}
module.exports = { informFinish };
