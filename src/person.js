class Person {
    constructor(uid, name, gender, house, block, room, intro, telegramId, registered, angel, mortal) {
        this.type = "Person";
        this.uid = uid || 0;
        this.name = name || "unnamed";
        this.gender = gender || "M";
        this.house = house || "Houseless";
        this.block = block || "G";
        this.room = room || "000";
        this.intro = intro || "";
        this.telegramId = telegramId || "";
        this.registered = registered || false;
        this.angel = angel;
        this.mortal = mortal;
    }

    static fromObject(obj) {
        return new Person(obj.uid, obj.name, obj.gender, obj.house, obj.block, obj.room, obj.intro, obj.telegramId, obj.registered, obj.angel, obj.mortal);
    }

    isPerson() {
        return true;
    }

    setAngel(person) {
        this.angel = person.uid;
        person.mortal = this.uid;
    }

    setMortal(person) {
        this.mortal = person.uid;
        person.angel = this.uid;
    }

    generateCode() {
        function mod(n) {
            return n % 26 + 65;
        }

        var str = this.block + this.room;
        str = str.split("").map(x => x.charCodeAt(0)).join("");
        var out = "";
        for (var i = 0; i < str.length; i += 2)
            out += String.fromCharCode(mod(parseInt(str.substr(i, 2))));
        return out;
    }

    static decode(str) {
        function revmod(n) {
            n = n - 65;
            while (n < 48)
                n += 26;
            return n;
        }

        str = str.split("").map(x => x.charCodeAt(0)).join("");
        var out = String.fromCharCode(65 + (parseInt(str.substr(0, 2))) % 26);
        for (var i = 2; i < str.length; i += 2)
            out += String.fromCharCode(revmod(parseInt(str.substr(i, 2))));
        return out;
    }

    display() {
        return this.name + " - " + this.block + this.room;
    }

    static isValid(str) {
        /* Rules:
        [0]: ABCDEF
        [1]: 1-8
        [2]: 0-4
        [3]: 0-9 */
        var rules = [
            [65, 70],
            [49, 56],
            [48, 52],
            [48, 57],
            [48, 57]
        ];
        if (str.length != 4 && str.length != 5) return false;
        for (var i in str) {
            var code = str[i].charCodeAt(0);
            if (rules[i][0] > code || rules[i][1] < code)
                return false;
        }
        return true;
    }
}

module.exports = Person;
