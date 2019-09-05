const base64 = require("base-64");

module.exports = {
    encode: function(id) {
        return base64.encode(id);
    },
    decode: function(id) {
        return base64.decode(id);
    }
};
