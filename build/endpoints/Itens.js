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
router.get("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let bdConn = null;
        try {
            const { id } = req.params;
            bdConn = yield (0, postgres_1.StartConnection)();
            const itens = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_compra, preco::numeric from item WHERE id_produto = $1;", [id]);
            const itensFormatados = itens.rows.map((item) => {
                return {
                    id: item.id,
                    data_compra: item.data_compra,
                    preco: Number(item.preco)
                };
            });
            res.status(200).send(itensFormatados);
        }
        catch (err) {
            res.status(500).send(err);
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
            const itemExistente = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM item WHERE id = $1;", [id]);
            if (itemExistente.rows.length === 0) {
                return res.status(404).send({
                    errors: ["Item não encontrado"],
                    msg: "Nenhum item foi encontrado com o ID fornecido."
                });
            }
            yield (0, postgres_1.Query)(bdConn, "DELETE FROM item WHERE id = $1;", [id]);
            res.status(200).send({
                errors: [],
                msg: `Item com ID ${id} deletado com sucesso.`
            });
        }
        catch (err) {
            res.status(500).send({
                errors: [err.message],
                msg: "Falha ao deletar o item."
            });
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
    });
});
//# sourceMappingURL=Itens.js.map