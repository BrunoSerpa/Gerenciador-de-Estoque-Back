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
            let id_marca = null;
            bdConn = yield (0, postgres_1.StartConnection)();
            if (typeof marca === "string") {
                try {
                    const resultadoMarca = yield (0, postgres_1.Query)(bdConn, "INSERT INTO marca (nome) VALUES ($1) RETURNING id;", [marca]);
                    id_marca = resultadoMarca.rows[0].id;
                }
                catch (err) {
                    const retorno = {
                        errors: [err.message],
                        msg: ["Falha ao cadastrar marca"],
                        data: null,
                    };
                    res.status(500).send(retorno);
                }
            }
            else if (typeof marca === "number") {
                id_marca = marca;
            }
            ;
            const resultadoProduto = yield (0, postgres_1.Query)(bdConn, "INSERT INTO produto (id_marca, garantia, validade, preco, quantidade) VALUES ($1, $2, $3, $4, 0) RETURNING id;", [id_marca, garantia, validade, preco]);
            const id_produto = resultadoProduto.rows[0].id;
            if (nomes) {
                try {
                    for (const nome of nomes) {
                        yield (0, postgres_1.Query)(bdConn, "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);", [id_produto, nome]);
                    }
                    ;
                }
                catch (err) {
                    const retorno = {
                        errors: [err.message],
                        msg: ["Falha ao cadastrar nomes"],
                        data: null,
                    };
                    res.status(500).send(retorno);
                }
            }
            ;
            const retorno = {
                errors: [],
                msg: ["Produto cadastrado com sucesso"],
                data: resultadoProduto.rows[0],
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
router.get("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM produto where id = $1;", [id]);
            const resultadoNomes = yield (0, postgres_1.Query)(bdConn, "SELECT nome FROM nome where id_produto = $1;", [id]);
            const produto = resultQuery.rows[0];
            const produtosFormatados = {
                garantia: produto.garantia,
                validade: produto.validade,
                preco: produto.preco,
                nomes: resultadoNomes.rows,
                marca: produto.id_marca
            };
            const retorno = {
                errors: [],
                msg: ["Produtos listados com sucesso"],
                data: {
                    rows: produtosFormatados,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao listar produtos"],
                data: null
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
router.get("", function (_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultadoMarcas = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM marca;", []);
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM produto;", []);
            const resultadoNomes = yield (0, postgres_1.Query)(bdConn, "SELECT * FROM nome;", []);
            const produtosFormatados = resultQuery.rows.map((produto) => {
                const marcaProduto = produto.id_marca
                    ? resultadoMarcas.rows.find((marca) => marca.id === produto.id_marca)
                    : undefined;
                const nomesProduto = resultadoNomes.rows
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
            const retorno = {
                errors: [],
                msg: ["Produtos listados com sucesso"],
                data: {
                    rows: produtosFormatados,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            const retorno = {
                errors: [err.message],
                msg: ["Falha ao listar produtos"],
                data: null
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
router.patch("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const { nomes, marca, garantia, validade, preco } = req.body;
        let bdConn = null;
        try {
            let id_marca = null;
            bdConn = yield (0, postgres_1.StartConnection)();
            if (typeof marca === "string") {
                try {
                    const resultadoMarca = yield (0, postgres_1.Query)(bdConn, "INSERT INTO marca (nome) VALUES ($1) RETURNING id;", [marca]);
                    id_marca = resultadoMarca.rows[0].id;
                }
                catch (err) {
                    const retorno = {
                        errors: [err.message],
                        msg: ["Falha ao cadastrar marca"],
                        data: null,
                    };
                    res.status(500).send(retorno);
                }
            }
            else if (typeof marca === "number") {
                id_marca = marca;
            }
            ;
            let valoresQuery = [];
            valoresQuery.push(`id_marca = '${id_marca}'`);
            if (garantia !== undefined)
                valoresQuery.push(`garantia = '${garantia}'`);
            if (validade !== undefined)
                valoresQuery.push(`validade = '${validade}'`);
            if (preco !== undefined)
                valoresQuery.push(`preco = '${preco}'`);
            yield (0, postgres_1.Query)(bdConn, `UPDATE produto SET ${valoresQuery.join(", ")} WHERE id = $1;`, [id]);
            const resultNomes = yield (0, postgres_1.Query)(bdConn, "SELECT id, nome FROM nome WHERE id_produto = $1;", [id]);
            const nomesAtuais = resultNomes.rows;
            let nomesParaRemover = [...nomesAtuais];
            for (const nome of nomes) {
                const nomeExistente = nomesAtuais.find((no) => no.nome === nome);
                if (nomeExistente) {
                    nomesParaRemover = nomesParaRemover.filter(it => it.id !== nomeExistente.id);
                }
                else {
                    try {
                        yield (0, postgres_1.Query)(bdConn, "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);", [id, nome]);
                    }
                    catch (err) {
                        const retorno = {
                            errors: [err.message],
                            msg: ["Falha ao cadastrar nome"],
                            data: null,
                        };
                        return res.status(500).send(retorno);
                    }
                }
                for (const nomeParaRemover of nomesParaRemover) {
                    yield (0, postgres_1.Query)(bdConn, `DELETE FROM nome WHERE id = $1;`, [nomeParaRemover.id]);
                }
                ;
            }
            ;
            const retorno = {
                errors: [],
                msg: ["Produto atualizado com sucesso"],
                data: null,
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
router.delete("/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        let bdConn = null;
        try {
            bdConn = yield (0, postgres_1.StartConnection)();
            const resultQuery = yield (0, postgres_1.Query)(bdConn, "DELETE FROM produto WHERE id = $1;", [id]);
            const retorno = {
                errors: [],
                msg: ["Produto deletado com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        }
        catch (err) {
            res.status(500).send({
                errors: [err.message],
                msg: "Falha ao deletar o produto"
            });
        }
        finally {
            if (bdConn)
                (0, postgres_1.EndConnection)(bdConn);
        }
        ;
    });
});
