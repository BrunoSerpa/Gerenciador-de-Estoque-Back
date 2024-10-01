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
exports.CadastroRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgres_1 = require("../services/postgres");
const router = express_1.default.Router();
exports.CadastroRouter = router;
router.post("", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data_cadastro, frete, titulo, itens } = req.body;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultadoCadastro = yield (0, postgres_1.Query)(bdConn, `INSERT INTO cadastro (data_cadastro, frete, titulo, custo_itens) 
                VALUES ($1, $2, $3, 0) RETURNING id;`, [data_cadastro, frete, titulo]);
            const id_cadastro = resultadoCadastro.rows[0].id;
            try {
                for (const item of itens) {
                    yield (0, postgres_1.Query)(bdConn, `INSERT INTO item (id_cadastro, id_produto, data_compra, preco) 
                        VALUES ($1, $2, $3, $4);`, [id_cadastro, item.id_produto, data_cadastro, item.preco]);
                }
                const retorno = {
                    errors: [],
                    msg: ["Cadastro cadastrada com sucesso"],
                    data: resultadoCadastro.rows[0],
                };
                res.status(200).send(retorno);
            }
            catch (err) {
                const retorno = {
                    errors: [err.message],
                    msg: ["Falha ao cadastrar itens"],
                    data: null,
                };
                res.status(500).send(retorno);
            }
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao cadastrar cadastro"],
                data: null,
            };
            res.status(500).send(retorno);
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
    });
});
router.get("", function (_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_cadastro, titulo, frete::numeric, custo_itens::numeric from cadastro;", []);
            const cadastrosFormatadas = resultQuery.rows.map((cadastro) => {
                return {
                    id: cadastro.id,
                    data_cadastro: cadastro.data_cadastro,
                    titulo: cadastro.titulo || undefined,
                    total: cadastro.frete ? Number(cadastro.custo_itens) + Number(cadastro.frete) : Number(cadastro.custo_itens)
                };
            });
            const retorno = {
                errors: [],
                msg: ["Cadastros listados com sucesso"],
                data: {
                    rows: cadastrosFormatadas,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao listar cadastros"],
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
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "DELETE FROM cadastro WHERE id = $1;", [id]);
            const retorno = {
                errors: [],
                msg: ["Cadastro deletado com sucesso"],
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
                msg: ["Falha ao deletar o cadastro"],
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
