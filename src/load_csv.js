const fs = require("fs");
const csv = require("csv-parser");
const Person = require("./simple_person.js");
const storage = require("node-persist");

storage.init({
    dir: './data/pairings',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    ttl: false,
    expiredInterval: 2 * 60 * 1000,
    forgiveParseErrors: false
}).then(init);

function init() {
    const results = [];
    const persons = [];
    fs.createReadStream("./data.csv")
        .pipe(csv())
        .on("data", data => {
            results.push(data);
        })
        .on("end", () => {
            // Assign group numbers
            let grpNum = 0;
            results.filter(i => i.name).forEach((item, index) => {
                if (item.name.indexOf("GROUP") !== -1) {
                    grpNum = item.name.split("GROUP ")[1]*1;
                } else {
                    let newPerson = new Person(index, item.name, item.room, grpNum);
                    persons.push(newPerson);
                }
            });

            // Assign mortals
            for (let i = 1; i <= 9; i++) {
                persons.filter(p => p.group === i).forEach((person, index, array) => {
                    if (index < array.length - 1) {
                        person.setMortal(array[index + 1]);
                    } else {
                        person.setMortal(array[0]);
                    }
                    const code = person.generateCode();
                    const decoded = Person.decode(code);
                    if (person.room !== decoded) {
                        throw new Error("Code generation failed, expected: " + code + ", got: " + decoded);
                    }
                    console.log(`${person.uid}. ${person.name} - ${person.room} (${person.generateCode()})`);
                })
            }

            // Save to storage
            persons.forEach(item => storage.setItem(item.uid.toString(), item));

        });
}

module.exports = init;
