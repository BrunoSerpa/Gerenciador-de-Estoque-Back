import express from "express";
import cors from "cors";


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

module.exports = app;