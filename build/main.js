"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const os_1 = __importDefault(require("os"));
const Cadastro_1 = require("./endpoints/Cadastro");
const Itens_1 = require("./endpoints/Itens");
const Marca_1 = require("./endpoints/Marca");
const Nomes_1 = require("./endpoints/Nomes");
const Produtos_1 = require("./endpoints/Produtos");
require("dotenv-ts").config();
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use(require("body-parser").urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
function getLocalIPAddress() {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}
app.listen(PORT, function () {
    const ip = getLocalIPAddress();
    console.log(`API aberta na porta ${PORT}`);
    console.log(`Link Online: http://${ip}:${PORT}`);
});
app.use("/cadastro", Cadastro_1.CadastroRouter);
app.use("/item", Itens_1.ItemRouter);
app.use("/marcas", Marca_1.MarcaRouter);
app.use("/nomes", Nomes_1.NomesRouter);
app.use("/produto", Produtos_1.ProdutoRouter);
module.exports = app;
