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
exports.VendaRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgres_1 = require("../services/postgres");
const router = express_1.default.Router();
exports.VendaRouter = router;
router.post("", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data_venda, frete, titulo, itens } = req.body;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultadoVenda = yield (0, postgres_1.Query)(bdConn, `INSERT INTO venda (data_venda, frete, titulo, custo_itens) 
                VALUES ($1, $2, $3, 0) RETURNING id;`, [data_venda, frete, titulo]);
            const id_venda = resultadoVenda.rows[0].id;
            try {
                for (const item of itens) {
                    const resultadoItem = yield (0, postgres_1.Query)(bdConn, `SELECT id FROM item 
                         WHERE id_produto = $1 AND id_venda IS NULL 
                         ORDER BY data_compra ASC 
                         LIMIT 1;`, [item.id_produto]);
                    if (resultadoItem.rows.length === 0) {
                        throw new Error(`Produto com ID ${item.id_produto} não disponível para venda.`);
                    }
                    const id_item = resultadoItem.rows[0].id;
                    yield (0, postgres_1.Query)(bdConn, `UPDATE item 
                         SET id_venda = $1, preco_venda = $2 
                         WHERE id = $3;`, [id_venda, item.preco, id_item]);
                }
                const retorno = {
                    errors: [],
                    msg: ["Venda cadastrada com sucesso"],
                    data: resultadoVenda.rows[0],
                };
                res.status(200).send(retorno);
            }
            catch (itemError) {
                yield (0, postgres_1.Query)(bdConn, `DELETE FROM venda WHERE id = $1;`, [id_venda]);
                const retorno = {
                    errors: [itemError.message],
                    msg: ["Falha ao cadastrar itens na venda"],
                    data: null,
                };
                res.status(500).send(retorno);
            }
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao cadastrar venda"],
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
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_venda, titulo, frete::numeric, custo_itens::numeric FROM venda;", []);
            const vendasFormatadas = resultQuery.rows.map((venda) => {
                return {
                    id: venda.id,
                    data_venda: venda.data_venda,
                    titulo: venda.titulo || undefined,
                    total: venda.frete ? Number(venda.custo_itens) + Number(venda.frete) : Number(venda.custo_itens)
                };
            });
            const retorno = {
                errors: [],
                msg: ["Vendas listadas com sucesso"],
                data: {
                    rows: vendasFormatadas,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao listar vendas"],
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
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT id, data_venda, titulo, frete::numeric FROM venda WHERE id = $1;", [id]);
            const resultQueryItens = yield (0, postgres_1.Query)(bdConn, "SELECT id_produto, preco_venda::numeric, COUNT(*) as quantidade FROM item WHERE id_venda = $1 GROUP BY id_produto, preco_venda;", [id]);
            const vendaFormatada = resultQuery.rows.map((venda) => {
                return {
                    id: venda.id,
                    data_venda: venda.data_venda,
                    titulo: venda.titulo || undefined,
                    itens: resultQueryItens.rows
                };
            });
            const retorno = {
                errors: [],
                msg: ["Venda visualizada com sucesso"],
                data: {
                    rows: vendaFormatada,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao visualizar venda"],
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
        const { data_venda, frete, itens, titulo } = req.body;
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            let valoresQuery = [];
            if (data_venda !== undefined)
                valoresQuery.push(`data_venda = '${data_venda}'`);
            if (frete !== undefined)
                valoresQuery.push(`frete = '${frete}'`);
            if (titulo !== undefined)
                valoresQuery.push(`titulo = '${titulo}'`);
            yield (0, postgres_1.Query)(bdConn, `UPDATE venda SET ${valoresQuery.join(", ")} WHERE id = ${id};`, []);
            for (const item of itens) {
                const resultadoItem = yield (0, postgres_1.Query)(bdConn, `SELECT id FROM item 
                     WHERE id_produto = $1 AND id_venda = $2 
                     ORDER BY data_compra ASC 
                     LIMIT 1;`, [item.id_produto, id]);
                if (resultadoItem.rows.length === 0) {
                    throw new Error(`Produto com ID ${item.id_produto} não disponível para atualização de venda.`);
                }
                const id_item = resultadoItem.rows[0].id;
                yield (0, postgres_1.Query)(bdConn, `UPDATE item 
                     SET preco_venda = $1 
                     WHERE id = $2;`, [item.preco, id_item]);
            }
            const retorno = {
                errors: [],
                msg: ["Venda atualizada com sucesso"],
                data: null,
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao atualizar venda"],
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
router.delete("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            yield (0, postgres_1.Query)(bdConn, "DELETE FROM venda WHERE id = $1;", [id]);
            const retorno = {
                errors: [],
                msg: ["Venda deletada com sucesso"],
                data: null
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao deletar a venda"],
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
