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
router.get("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_cadastro, titulo, frete::numeric from cadastro WHERE id = $1;", [id]);
            const resultQueryItens = yield (0, postgres_1.Query)(bdConn, "SELECT id_produto, preco::numeric, COUNT(*) as quantidade FROM item WHERE id_cadastro = $1 GROUP BY id_produto, preco;", [id]);
            const cadastroFormatado = resultQuery.rows.map((cadastro) => {
                return {
                    id: cadastro.id,
                    data_cadastro: cadastro.data_cadastro,
                    titulo: cadastro.titulo || undefined,
                    itens: resultQueryItens.rows
                };
            });
            const retorno = {
                errors: [],
                msg: ["Cadastros listados com sucesso"],
                data: {
                    rows: cadastroFormatado,
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
router.patch("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data_cadastro, frete, itens, titulo } = req.body;
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            let valoresQuery = [];
            if (data_cadastro !== undefined)
                valoresQuery.push(`data_cadastro = '${data_cadastro}'`);
            if (frete !== undefined)
                valoresQuery.push(`frete = '${frete}'`);
            if (itens !== undefined)
                valoresQuery.push(`itens = '${itens}'`);
            if (titulo !== undefined)
                valoresQuery.push(`nome = '${titulo}'`);
            yield (0, postgres_1.Query)(bdConn, `UPDATE alerta SET ${valoresQuery.join(", ")} WHERE id = ${id};`, []);
            const resultItens = yield (0, postgres_1.Query)(bdConn, "SELECT id, id_produto, data_compra, preco FROM item WHERE id_cadastro = $1;", [id]);
            const itensAtuais = resultItens.rows;
            for (const item of itens) {
                const itemExistente = itensAtuais.find((it) => it.id_produto === item.id_produto);
                if (itemExistente) {
                    yield (0, postgres_1.Query)(bdConn, `UPDATE item SET data_compra = $1, preco = $2 WHERE id = $3;`, [data_cadastro, item.preco, itemExistente.id]);
                }
                else {
                    yield (0, postgres_1.Query)(bdConn, `INSERT INTO item (id_cadastro, id_produto, data_compra, preco) 
                        VALUES ($1, $2, $3, $4);`, [id, item.id_produto, data_cadastro, item.preco]);
                }
            }
            const idsProdutosRecebidos = itens.map((it) => it.id_produto);
            const itensParaRemover = itensAtuais.filter((it) => !idsProdutosRecebidos.includes(it.id_produto));
            for (const itemParaRemover of itensParaRemover) {
                yield (0, postgres_1.Query)(bdConn, `DELETE FROM item WHERE id = $1;`, [itemParaRemover.id]);
            }
            const retorno = {
                errors: [],
                msg: ["Cadastro atualizado com sucesso"],
                data: null
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao atualizar cadastro"],
                data: null
            };
            res.status(500).send(retorno);
        }
        if (bdConn)
            (0, postgres_1.EndConnection)(bdConn);
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
