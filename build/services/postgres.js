"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartConnection = StartConnection;
exports.EndConnection = EndConnection;
exports.Query = Query;
const pg_1 = require("pg");
require('dotenv-ts').config();
function StartConnection() {
    const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, PGPORT } = process.env;
    if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID || !PGPORT) {
        throw "Erro ao carregar variáveis de ambiente";
    }
    return new pg_1.Pool({
        host: PGHOST,
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE,
        port: parseInt(PGPORT),
        ssl: true
    });
}
function EndConnection(conn) {
    conn.end();
}
function Query(conn, query, valores) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield conn.query(query, valores);
            return result;
        }
        catch (err) {
            throw err;
        }
    });
}
