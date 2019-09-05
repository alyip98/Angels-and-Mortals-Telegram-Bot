/*

*/
const SEED = "hello.ab";
const seedrandom = require("seedrandom");
const Person = require("../person.js");
var fs = require('fs');
var houseNames = ["Panthera", "Aonyx", "Chelonia", "Strix", "Rusa"];
seedrandom(SEED, {global: true});
var persons = [];

fs.readFile('data-final.tsv', 'utf8', function (err, contents) {
    init(contents);
});

function init(contents) {
    var data = parseData(contents);
    data = sort(data);
    makeLoop(data);

    write("out.txt", JSON.stringify(persons));
}

/* Parses the raw file data into JSON format */
function parseData(contents) {
    // Format definition for excel file
    var format = {
        headers: ["", "name", "house", "block", "room", "intro", "", "", "", "", "", "", "gender"]
    };
    contents = contents.split("\r").join("").split("\n");
    persons = [];
    for (var i = 1; i < contents.length; i++) {
        var line = contents[i].split("	");
        var obj = {};
        obj.uid = i - 1;
        for (var j = 0; j < format.headers.length; j++) {
            if (format.headers[j] === "room") {
                // strip block from room number
                obj[format.headers[j]] = line[j].match(/\d+/)[0];
            } else if (format.headers[j] === "block") {
                // strip block from room number
                obj[format.headers[j]] = line[j].replace("Tower", "F");
            } else if (format.headers[j] !== "")
                obj[format.headers[j]] = line[j];
        }
        // console.log(obj);
        persons.push(Person.fromObject(obj));
    }

    return persons;
}

/* Sorts data by house/gender */
function sort(data) {
    var houses = {};
    for (var i in houseNames) {
        houses[houseNames[i]] = {
            M: [],
            F: []
        };
    }

    for (var i in data) {
        var person = data[i];
        var house = person.house;
        var gender = person.gender;
        if (houseNames.indexOf(house) == -1) {
            console.log("No such house (" + house + ")");
            continue;
        }
        if (gender == "") {
            console.log("Gender field is empty: ", person);
            continue;
        }
        houses[house][gender].push(person);
    }
    return houses;
}

/* Generates the pairings */
function makeLoop(data) {
    /* Utility function to flip gender */
    function g(gender) {
        return gender == "M" ? "F" : "M";
    }

    /* Utility function to count number of people left */
    function count(data) {
        var c = 0;
        for (var i in data) {
            for (var j in data[i]) {
                c += data[i][j].length;
            }
        }
        return c;
    }

    function countHouse(data) {
        var c = {};
        for (var i in data) {
            c[i] = 0;
            for (var j in data[i]) {
                c[i] += data[i][j].length;
            }
        }
        return c;
    }

    /* Utility function to get a random element from an array */
    function popRandom(array) {
        return array.splice(Math.floor(Math.random() * array.length), 1)[0];
    }

    /* Utility function to peek a random element from an array */
    function peekRandom(array) {
        var index = Math.floor(Math.random() * array.length);
        return [array[index], index];
    }

    function weightedRNG(weights) {
        var sum = 0;
        weights.forEach(x => sum += x);
        var rand = Math.random() * sum;
        for (var current = 0; current < weights.length; current++) {
            rand -= weights[current];
            if (rand <= 0)
                return current;
        }
        return weights.length - 1;
    }

    var empty = false;
    var currentHouse = 0;
    var currentGender = "M";
    var previousPerson;
    var firstPerson;
    var sameHousePairs = 0;
    var sameGenderPairs = 0;
    var idx;
    // ["Panthera", "Aonyx", "Chelonia", "Strix", "Rusa"];
    var weightMatrix = [
        [0.01, 0.1, 0.1, 10, 10],
        [10, 0.01, 5, 1, 1],
        [10, 1, 0.01, 5, 1],
        [10, 1, 1, 0.01, 5],
        [5, 1, 1, 1, 0.01]];
    while (!empty) {
        currentHouse = previousPerson ? houseNames.indexOf(previousPerson.house) : 0;
        var randomHouse = weightedRNG(weightMatrix[currentHouse]);
        var counts = countHouse(data);
        var totalCount = count(data);
        empty = totalCount == 0;
        console.log("Selected house: " + houseNames[randomHouse]);
        //console.log(data);

        if (previousPerson && previousPerson.house == houseNames[randomHouse]) {
            console.log("Same house as last person");
            // if currently selected house is same as last
            // see if we can change
            if (counts[houseNames[randomHouse]] == totalCount) {
                console.log("All left from this house");
                // all left from this house
                // then bobian
                person = popRandom(data[houseNames[randomHouse]][currentGender]);

                // cannot get desired gender
                if (!person) {
                    console.log("Cannot get desired gender");
                    person = popRandom(data[houseNames[randomHouse]][g(currentGender)]);
                    currentGender = g(currentGender);
                }
            } else {
                console.log("try another house");
                // console.log(counts[randomHouse], totalCount);
                continue;
            }
        } else {
            //	console.log("Diff house");
            person = popRandom(data[houseNames[randomHouse]][currentGender]);
            if (!person) {
                //console.log("Cannot get desired gender");
                person = popRandom(data[houseNames[randomHouse]][g(currentGender)]);
                currentGender = g(currentGender);
            }
        }

        if (!person) {
            /*console.log(data);
            console.log(previousPerson);
            console.log(houseNames[randomHouse]);
            throw new Error("a");*/
            continue;
        }

        if (previousPerson) {
            //if (previousPerson.house != person.house || count(data) == countHouse(data)[person.house]) {
            console.log(">> " + previousPerson.house + "---" + person.house);
            if (previousPerson.house == person.house)
                sameHousePairs++;
            if (previousPerson.gender == person.gender)
                sameGenderPairs++;
            previousPerson.setMortal(person);
            // console.log(person);
            //}
        } else
            firstPerson = person;

        previousPerson = person;
        currentGender = g(currentGender);
    }
    previousPerson.setMortal(firstPerson);
    console.log("Same house pairs: " + sameHousePairs);
    console.log("Same gender pairs: " + sameGenderPairs);
}

/* Writes data to file */
function write(file, data) {
    const dataUA = new Uint8Array(Buffer.from(data));
    fs.writeFile(file, dataUA, (err) => {
        if (err) throw err;
        console.log('Written to ', file, '!');
    });
}
