/*
TODO:
testing
- basic
- photo
broadcast function

*/
const http = require('http');

require("dotenv").config();

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const Person = require("./src/simple_person.js");
const msgs = require('./src/bot_messages.js');
const storage = require('node-persist');
const Codec = require("./src/util/encode");
const AMBot = new TelegramBot(process.env.botToken, {polling: true});

const UtilBot = new TelegramBot(process.env.utilToken, {polling: true});

const PersonUtil = {
    /* Finds the Person associated with that telegram ID */
    getPersonByTelegramId: function (id) {
        for (var i in cachedData) {
            if (cachedData[i].telegramId == id)
                return cachedData[i];
        }
        return null;
    },

    /* Check whether the Person associated with that telegram ID exists */
    exists: function (id) {
        return getPersonByTelegramId(id) != null;
    },

    getPersonByRoom: function (room) {
        for (var i in cachedData) {
            if (cachedData[i].room === room)
                return cachedData[i];
        }
        return null;
    }
};
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const ANGEL = {
    name: "Angel",
    serialized: "angel"
};

const MORTAL = {
    name: "Mortal",
    serialized: "mortal",
    other: ANGEL
};

ANGEL.other = MORTAL;
var Log = {
    log: [],
};

function customLog() {
    console.log(args);
}

var cachedData;
var cachedWebpage;
var server;

async function init() {
    console.log("Hello world");
    setupCLI();
    await setupStorage();
    for(let i in cachedData) {
        let item = cachedData[i];
        console.log(item.toString());
    }
    await setupServer();
    setupBot();
}

/* Setup CLI */
function setupCLI() {
    readline.on("line", input => {
        var command = input.trim().split(" ")[0];
        if (command === "show" || command === "s") {
            /* Show cached data */
            if (input.split(" ")[1]) {
                var num = input.split(" ")[1] * 1;
                console.log(cachedData[num].toString());
            } else {
                for (let i in cachedData)
                    console.log(cachedData[i].toString());
                console.log(Object.keys(cachedData).length + " items");
            }
        } else if (command === "reset") {
            /* Load data into storage from out.txt */
            require("./src/load_csv")();
        } else if (command === "load") {
            loadDataToCache();
        } else if (command === "unregister") {
            if (input.split(" ")[1]) {
                var num = input.split(" ")[1] * 1;
                deregister(num);
            } else {
                console.log("Id required");
            }
        } else {
            console.log("Invalid command");
        }
    });
    console.log("CLI setup successfully");
}

/* Setup storage module */
async function setupStorage() {
    await storage.init({
        dir: './data/pairings',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,
        ttl: false,
        expiredInterval: 2 * 60 * 1000,
        forgiveParseErrors: false
    });
    await loadDataToCache();
}

/* Load data to memory */
async function loadDataToCache() {
    var keys = await storage.keys();
    var obj = {};
    for (var i in keys) {
        var person = Person.fromObject(await storage.get(keys[i]));
        obj[keys[i]] = person;
    }
    cachedData = obj;
    for (var i in cachedData) {
        if (cachedData[i].constructor.name != "Person")
            throw new Error("Object not an instance of Person!");
    }
    console.log("Data loaded to cache!");
}

/* Save data to file */
async function saveData() {

}

/* Setup webpage on :8000*/
function setupServer() {
    function formatData(obj) {
        var headers = "Room|Name|Mortal".split("|");
        var style = fs.readFileSync("./views/styles.css");
        var html = "<style>" + style + "</style>";
        html += "<table><tr>";
        for (var i in headers) {
            html += "<th>" + headers[i] + "</th>";
        }
        html += "</tr>";
        for (let i in obj) {
            let item = obj[i];
            html += "<tr>" + item.toString() + "</tr>";
        }
        // var n = Object.keys(obj).length;
        // var current = 0;
        // while (n > 0) {
        //     const person = obj[current];
        //     // var person = Person.fromObject(obj[current]);
        //     if (!person) break;
        //     var mortal = cachedData[person.mortal];
        //     html += "<tr>";
        //     //html += "<td>" + person.uid + "</td>";
        //     // html += "<td>" + person.generateCode() + "</td>";
        //     // html += formatRegister(person.registered);
        //     html += "<td>" + person.room + "</td>";
        //     html += "<td>" + person.name + "</td>";
        //     //html += "<td>" + person.intro + "</td>";
        //     // html += "<td>" + formatHouse(person.house) + "</td>";
        //     // html += "<td>" + formatHouse(mortal.house) + "</td>";
        //     html += "<td>" + mortal.room + "</td>";
        //     html += "<td>" + mortal.name + "</td>";
        //     //html += "<td>" + formatHouse(obj[person.mortal].house) + "</td>";
        //     html += "</tr>";
        //     current = person.mortal;
        //     n--;
        // }
        html += "</table>";
        return html;
    }

    function formatHouse(h) {
        return "<span class=" + h + ">" + h + "</span>";
    }

    function formatRegister(r) {
        return "<td class='register-" + r + "'></td>";
    }

    // TODO: Change to use cachedData
    // cachedWebpage = formatData(cachedData);
    server = http.createServer(function (request, response) {
        if (request.method === 'GET' && request.url === '/debug') {
            // ask the bot to do stuff
            response.end();
        } else if (request.url === '/data') {
            response.write(JSON.stringify(cachedData));
            response.end();
        } else {
            response.writeHeader(200, {"Content-Type": "text/html"});
            response.write(formatData(cachedData));
            response.end();
        }
    }).listen(8000);
    console.log("Server setup successfully!");
}

/* Setup bots with message handlers */
function setupBot() {
    /* AM Bot */
    /* Exactly "/a" or "/m" */
    AMBot.onText(/\/[a|m]$/, (msg, match) => {
        // TODO: shows the user how to use commands
    });

    /* Send message to angel*/
    AMBot.onText(/\/a (.+)/, (msg, match) => sendChat(msg, match, ANGEL));

    /* Send message to mortal*/
    AMBot.onText(/\/m (.+)/, (msg, match) => sendChat(msg, match, MORTAL));

    /* Register */
    AMBot.onText(/\/register (.+)/, (msg, match) => {
        register(msg, match);
    });

    AMBot.onText(/\/status(.*)/, (msg, match) => {
        status(msg, match);
    });

    AMBot.onText(/\/start(.*)/, (msg, match) => {
        console.log(msg.chat.id + " just started using the bot!");
        AMBot.sendMessage(msg.chat.id, msgs.WELCOME_MESSAGE, {parse_mode: "Markdown"});
    });

    AMBot.onText(/\/help(.*)/, (msg, match) => {
        AMBot.sendMessage(msg.chat.id, msgs.WELCOME_MESSAGE, {parse_mode: "Markdown"});
    });

    AMBot.onText(/\/feedback (.+)/, (msg, match) => {
        var sender = PersonUtil.getPersonByTelegramId(msg.chat.id);
        if (sender) {
            UtilBot.sendMessage(me.telegramId, sender.name + ": " + match[1]);
            AMBot.sendMessage(sender.telegramId, "Feedback received");
        } else {
            UtilBot.sendMessage(me.telegramId, msg.from.first_name + "(" + msg.chat.id + "): " + match[1]);
        }
    });

    AMBot.on("photo", (msg) => {
        console.log("Received photo");
        // console.log(msg);
        if (!msg.caption) {
            console.log("Received captionless photo");
            sendMessage(AMBot, msg.chat.id, msgs.PHOTO_CAPTION_REQUIRED);
            // TODO: Add buttons to redirect photo to angel/mortal
        } else if (msg.caption.indexOf("/a") != -1) {
            sendPhoto(msg, ANGEL);
        } else if (msg.caption.indexOf("/m") != -1) {
            sendPhoto(msg, MORTAL);
        } else {
            console.log("Weird photo");
            console.log(msg);
        }
    });

    AMBot.on("text", msg => {
        // console.log(msg);
        var now = new Date();
        console.log("[" + now.toLocaleDateString() + ", " + now.toLocaleTimeString() + "] " + msg.from.first_name + ": " + msg.text);
    });

    /* Util Bot */
    UtilBot.on("message", msg => {
        console.log(msg);
        // echo
        sendMessage(UtilBot, me.telegramId, "Message received");
    });

    /* Deregister */
    UtilBot.onText(/\/deregister (.+)/, (msg, match) => {
        var id = match[1];
        deregister(id);
    });

    /* Show data */
    UtilBot.onText(/\/show(.*)/, (msg, match) => {
        // console.log("ASD: " + match[1]);
        if (match[1].trim() != "") {
            var num = match[1].trim() * 1;
            // console.log("NUM: " + num);
            UtilBot.sendMessage(me.telegramId, JSON.stringify(cachedData[num]));
        } else {
            console.log("showall");
            for (var i in cachedData) {
                console.log(cachedData[i]);
                // UtilBot.sendMessage(me.telegramId, JSON.stringify(cachedData[i]));
            }
        }
    });

    /* set room */
    UtilBot.onText(/\/setroom (.+)/, (msg, match) => {
        // console.log("ASD: " + match[1]);
        var args = match[1].trim().split(" ");
        var person = cachedData[args[0]];
        console.log("Args: ", args);
        if (Person.isValid(person.block + args[1])) {
            cachedData[args[0]].room = args[1];
            UtilBot.sendMessage(me.telegramId, "Changed " + cachedData[args[0]].name + "'s room to " + args[1]);
        } else {
            UtilBot.sendMessage(me.telegramId, "Something went wrong: " + args[0] + ":" + args[1]);
        }
    });

    /* Broadcast */
    UtilBot.onText(/\/b (.+)/, (msg, match) => {
        var text = match[1].trim();
        for (let i in cachedData) {
            try {
                if (cachedData[i].registered)
                    AMBot.sendMessage(cachedData[i].telegramId, text);
            } catch (e) {
                console.log("Error when sending to " + cachedData[i].name);
            }
        }
    });

    // AMBot.sendMessage(me.telegramId, msgs.STARTUP_MSG);
    // UtilBot.sendMessage(me.telegramId, msgs.STARTUP_MSG);

    console.log("Bots setup successfully");
}


/* Handles /register commands */
async function register(msg, match) {
    if (msg.chat.type === 'group') {
        return;
    }
    var senderId = msg.chat.id;

    var code = match[1].trim();
    var decoded = Person.decode(code);

    console.log("Code", code, decoded);

    if (!Person.isValid(decoded)) {
        // invalid code
        console.log("invalid code", code);
        sendMessage(AMBot, senderId, msgs.ERROR_INVALID_CODE);
        return;
    }

    var obj = PersonUtil.getPersonByRoom(decoded);
    if (!obj) {
        console.log("Error: Couldn't find Person with room: ", decoded);
        return;
    }

    if (obj.registered) {
        console.log("Already registered " + code);
        sendMessage(AMBot, senderId, msgs.ERROR_ALREADY_REGISTERED);
        return;
    }

    obj.registered = true;
    obj.telegramId = senderId;
    storage.setItem(obj.uid + "", obj);
    console.log(obj.display(), "registered successfully");
    sendMessage(AMBot, senderId, msgs.SUCCESS_MESSAGE);


    // console.log("Mortal", obj.mortal);
    // console.log("Angel", obj.angel);

    var angel = cachedData[obj.angel];
    var mortal = cachedData[obj.mortal];

    if (mortal.registered) {
        console.log("Sending alert to", obj.mortal);
        sendMarkdownMessage(AMBot, mortal.telegramId, msgs.ALERT_ANGEL_REGISTER);
    }

    if (angel.registered) {
        console.log("Sending alert to", obj.angel);
        sendMarkdownMessage(AMBot, angel.telegramId, msgs.ALERT_MORTAL_REGISTER);
    }
}

/* Deregister */
function deregister(id) {
    var person = cachedData[id];
    person.registered = false;
    person.telegramId = -1;
    storage.setItem(person.uid.toString(), person);
}

/* Displays the status of their angel/mortal */
function status(msg, match) {
    var senderId = msg.chat.id;
    var sender = PersonUtil.getPersonByTelegramId(senderId);

    var angel = cachedData[sender.angel];
    var mortal = cachedData[sender.mortal];

    // console.log("Sender: ", sender, "\nAngel", angel, "\nMortal", mortal, "\n");
    // console.log(cachedData);

    var angelStr = "Angel: ";

    if (!angel.registered) {
        angelStr += "Not ";
    }
    angelStr += "On Telegram";

    var mortalStr = "Mortal (" + mortal.display() + "): ";

    if (!mortal.registered) {
        mortalStr += "Not ";
    }
    mortalStr += "On Telegram\n";

    var message = angelStr + "\n" + mortalStr;

    sendMessage(AMBot, senderId, message);
    console.log(sender.display(), "requested for status");
}

/* Sends a chat to angel/mortal based on relation */
function sendChat(msg, match, relation) {
    /*
    relation can be either ANGEL or MORTAL
    */
    // validate sender ID
    var sender = PersonUtil.getPersonByTelegramId(msg.chat.id);

    if (sender == null) {
        // sender not registered
        console.log("Sender not registered");
        sendMarkdownMessage(AMBot, msg.chat.id, msgs.PLEASE_REGISTER);
        return;
    }

    var target = cachedData[sender[relation.serialized]];

    if (target == null) {
        console.log(relation.name + " non-existent");
        // mortal non-existent?
        return;
    }

    // check if mortal is registered
    if (!target.registered) {
        // mortal not registered yet
        console.log(relation.name + " not registered");
        if (relation === ANGEL)
            sendMessage(AMBot, msg.chat.id, msgs.ANGEL_NOT_REGISTERED);
        else
            sendMessage(AMBot, msg.chat.id, msgs.MORTAL_NOT_REGISTERED);
        return;
    }

    sendMessage(AMBot, msg.chat.id, "Sent to " + relation.serialized);
    sendMessage(AMBot, target.telegramId, relation.other.name + ": " + match[1]);
    console.log(sender.display() + " sent a message to their " + relation.serialized);
}

/* Sends a chat to angel/mortal based on relation */
function sendPhoto(msg, relation) {
    /*
    relation can be either ANGEL or MORTAL
    */
    // validate sender ID
    var sender = PersonUtil.getPersonByTelegramId(msg.chat.id);
    console.log(sender.display() + " is trying to send a photo to their " + relation.serialized);
    if (sender == null) {
        // sender not registered
        console.log("Sender not registered");
        sendMarkdownMessage(AMBot, msg.chat.id, msgs.PLEASE_REGISTER);
        return;
    }

    var target = cachedData[sender[relation.serialized]];

    if (target == null) {
        console.log(relation.name + " non-existent");
        // mortal non-existent?
        return;
    }

    // check if mortal is registered
    if (!target.registered) {
        // mortal not registered yet
        console.log(relation.name + " not registered");
        if (relation == ANGEL)
            sendMessage(AMBot, msg.chat.id, msgs.ANGEL_NOT_REGISTERED);
        else
            sendMessage(AMBot, msg.chat.id, msgs.MORTAL_NOT_REGISTERED);
        return;
    }

    try {
        var caption = msg.caption.replace("/a", "Mortal:");
        caption = caption.replace("/m", "Angel:");
        AMBot.sendPhoto(target.telegramId, msg.photo[0].file_id, {caption: caption});
        sendMessage(AMBot, msg.chat.id, "Sent to " + relation.serialized);
    } catch (e) {
        sendMessage(AMBot, msg.chat.id, msgs.FAILED_TO_SEND);
        console.log("A photo from " + sender + " has failed to send");
    }
    console.log(sender.display() + " sent a photo to their " + relation.serialized);
}

function sendMessage(bot, target, message) {
    if (typeof target == "object")
        target = target.telegramId;
    if (target == null) {
        console.log("sendMessage has no target: ", message);
        return;
    }
    try {
        bot.sendMessage(target, message);
    } catch (e) {
        console.log(e);
    }
}

function sendMarkdownMessage(bot, target, message) {
    if (typeof target == "object")
        target = target.telegramId;
    if (target == null) {
        console.log("sendMessage has no target: ", message);
        return;
    }
    try {
        bot.sendMessage(target, message, {parse_mode: "Markdown"});
    } catch (e) {
        console.log(e);
    }
}

setImmediate(init);
