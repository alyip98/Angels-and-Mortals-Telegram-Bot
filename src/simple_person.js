const Codec = require("./util/encode");

class Person {
    constructor(uid, name, room, group, telegramId, registered, angel, mortal) {
        this.type = "Person";
        this.uid = uid || 0;
        this.name = name || "unnamed";
        this.room = room || "000";
        this.group = group || 0;
        this.telegramId = telegramId || "";
        this.registered = registered || false;
        this.angel = angel;
        this.mortal = mortal;
    }

    static fromObject(obj) {
        return new Person(obj.uid, obj.name, obj.room, obj.group, obj.telegramId, obj.registered, obj.angel, obj.mortal);
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
        return Codec.encode(this.room);
    }

    static decode(str) {
        return Codec.decode(str);
    }

    display() {
        return this.name + " - " + this.room;
    }

    toString() {
        return `${this.uid}. ${this.name} - ${this.room} [${this.group}] a=${this.angel}, m=${this.mortal} ${this.registered ? "YES" : "NO"} ${this.generateCode()}`;
    }

    static isValid(str) {
        /* Rules:
        [0]: ABCDEF
        [1]: 1-8
        [2]: 0-4
        [3]: 0-9 */
        return true;
    }
}

module.exports = Person;
