import express from "express";
import cors from "cors";

import { ProdutoRouter } from "./endpoints/Produtos";
import { CadastroRouter } from "./endpoints/Cadastro";
import { ItemRouter } from "./endpoints/Itens";

require("dotenv-ts").config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(require("body-parser").urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.listen(
  PORT,
  function () {
    console.log(`API aberta na porta ${PORT}`);
  }
);

app.use("/produto", ProdutoRouter);
app.use("/cadastro", CadastroRouter);
app.use("/item", ItemRouter);

module.exports = app;