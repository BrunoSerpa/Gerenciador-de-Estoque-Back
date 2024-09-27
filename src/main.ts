import express from "express";
import cors from "cors";
import os from "os";

import { ProdutoRouter } from "./endpoints/Produtos";
import { CadastroRouter } from "./endpoints/Cadastro";
import { ItemRouter } from "./endpoints/Itens";

require("dotenv-ts").config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(require("body-parser").urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.listen(
  PORT,
  function () {
    const ip = getLocalIPAddress();
    console.log(`API aberta na porta ${PORT}`);
    console.log(`Link Online: http://${ip}:${PORT}`);
  }
);

app.use("/produto", ProdutoRouter);
app.use("/cadastro", CadastroRouter);
app.use("/item", ItemRouter);

module.exports = app;