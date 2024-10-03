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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgres_1 = require("../services/postgres");
const router = express_1.default.Router();
exports.ItemRouter = router;
router.get("/:id_produto", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id_produto } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_compra, preco::numeric from item WHERE id_produto = $1;", [id_produto]);
            const itensFormatados = resultQuery.rows.map((item) => {
                return {
                    id: item.id,
                    data_compra: item.data_compra,
                    preco: Number(item.preco)
                };
            });
            const retorno = {
                errors: [],
                msg: ["Itens listadas com sucesso"],
                data: {
                    rows: itensFormatados,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao listar itens"],
                data: null
            };
            res.status(500).send(retorno);
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
    });
});
router.delete("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "DELETE FROM item WHERE id = $1;", [id]);
            const retorno = {
                errors: [],
                msg: ["Item deletado com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao deletar o item"],
                data: null
            };
            res.status(500).send(retorno);
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
    });
});
