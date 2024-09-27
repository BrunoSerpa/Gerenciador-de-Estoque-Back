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
exports.ProdutoRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgres_1 = require("../services/postgres");
const router = express_1.default.Router();
exports.ProdutoRouter = router;
router.post("", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nomes, marca, garantia, validade, preco } = req.body;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            let id_marca = null;
            if (typeof marca === "string") {
                const resultMarca = yield (0, postgres_1.Query)(bdConn, "INSERT INTO marca (nome) VALUES ($1) RETURNING id;", [marca]);
                id_marca = resultMarca.rows[0].id;
            }
            else if (typeof marca === "number") {
                id_marca = marca;
            }
            ;
            const resultadoProduto = yield (0, postgres_1.Query)(bdConn, "INSERT INTO produto (id_marca, garantia, validade, preco, quantidade) VALUES ($1, $2, $3, $4, 0) RETURNING id;", [id_marca, garantia, validade, preco]);
            const id_produto = resultadoProduto.rows[0].id;
            if (nomes) {
                for (const nome of nomes) {
                    yield (0, postgres_1.Query)(bdConn, "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);", [id_produto, nome]);
                }
                ;
            }
            ;
            const retorno = {
                errors: [],
                msg: ["Produto cadastrado com sucesso"],
                data: resultadoProduto.rows,
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao cadastrar produto"],
                data: null,
            };
            res.status(500).send(retorno);
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
        ;
    });
});
router.get("", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const marcas = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM marca;", []);
            const produtos = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM produto;", []);
            const nomes = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM nome;", []);
            const produtosFormatados = produtos.rows.map((produto) => {
                const marcaProduto = produto.id_marca
                    ? marcas.rows.find((marca) => marca.id === produto.id_marca)
                    : undefined;
                const nomesProduto = nomes.rows
                    .filter((nome) => nome.id_produto === produto.id)
                    .map((nome) => ({
                    id: nome.id,
                    nome: nome.nome
                }));
                return {
                    id: produto.id,
                    garantia: produto.garantia,
                    validade: produto.validade,
                    preco: produto.preco,
                    quantidade: produto.quantidade,
                    nomes: nomesProduto,
                    marca: marcaProduto ? { id: marcaProduto.id, nome: marcaProduto.nome } : undefined
                };
            });
            res.status(200).send(produtosFormatados);
        }
        catch (err) {
            res.status(500).send(err);
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
        ;
    });
});
router.delete("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const produtoExistente = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM produto WHERE id = $1;", [id]);
            if (produtoExistente.rows.length === 0) {
                return res.status(404).send({
                    errors: ["Produto não encontrado"],
                    msg: "Nenhum produto foi encontrado com o ID fornecido."
                });
            }
            ;
            yield (0, postgres_1.Query)(bdConn, "DELETE FROM produto WHERE id = $1;", [id]);
            res.status(200).send({
                errors: [],
                msg: `Produto com ID ${id} deletado com sucesso.`
            });
        }
        catch (err) {
            res.status(500).send({
                errors: [err.message],
                msg: "Falha ao deletar o produto."
            });
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
        ;
    });
});
//# sourceMappingURL=Produtos.js.map