"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_ts_1 = require("bcrypt-ts");
function HashPassword(password) {
    return (0, bcrypt_ts_1.hashSync)(password);
}
function HashPasswordCompare(hash, password) {
    return (0, bcrypt_ts_1.compareSync)(password, hash);
}
module.exports = { HashPassword, HashPasswordCompare };
