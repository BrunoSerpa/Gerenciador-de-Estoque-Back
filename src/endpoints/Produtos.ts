import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";

import { Marca } from "../types/Marca";
import { Nome, NomeAtualizar, NomeVisualizar } from "../types/Nome";
import { Produto, CadastrarProduto, VisualizarProduto, AtualizarProduto, VisualizarProduto2 } from "../types/Produto";
import { RespostaPadrao } from "../types/Response";

const router = express.Router();

router.post(
    "",
    async function (req: Request, res: Response) {
        const {
            nomes,
            marca,
            garantia,
            validade,
            preco
        } = req.body as CadastrarProduto;

        let bdConn: Pool | null = null;
        try {
            let id_marca: number | null = null;

            bdConn = await StartConnection();
            if (typeof marca === "string") {
                try {
                    const resultadoMarca = await Query(
                        bdConn,
                        "INSERT INTO marca (nome) VALUES ($1) RETURNING id;",
                        [marca]
                    );
                    id_marca = resultadoMarca.rows[0].id;
                } catch (err) {
                    const retorno = {
                        errors: [(err as Error).message],
                        msg: ["Falha ao cadastrar marca"],
                        data: null,
                    } as RespostaPadrao;
                    res.status(500).send(retorno);
                }
            } else if (typeof marca === "number") {
                id_marca = marca;
            };

            const resultadoProduto = await Query(
                bdConn,
                "INSERT INTO produto (id_marca, garantia, validade, preco, quantidade) VALUES ($1, $2, $3, $4, 0) RETURNING id;",
                [id_marca, garantia, validade?? null, preco]
            );

            const id_produto = resultadoProduto.rows[0].id;

            if (nomes) {
                try {
                    for (const nome of nomes) {
                        await Query(
                            bdConn,
                            "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);",
                            [id_produto, nome]
                        );
                    };
                } catch (err) {
                    const retorno = {
                        errors: [(err as Error).message],
                        msg: ["Falha ao cadastrar nomes"],
                        data: null,
                    } as RespostaPadrao;
                    res.status(500).send(retorno);
                }
            };

            const retorno = {
                errors: [],
                msg: ["Produto cadastrado com sucesso"],
                data: resultadoProduto.rows[0],
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao cadastrar produto"],
                data: null,
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);

router.get(
    "/:id",
    async function (req: Request, res: Response) {
        const { id } = req.params;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();
            const resultQuery = await Query<Produto>(
                bdConn,
                "SELECT * FROM produto where id = $1;",
                [id]
            );

            const resultadoNomes = await Query(
                bdConn,
                "SELECT nome FROM nome where id_produto = $1;",
                [id]
            );

            const produto: Produto = resultQuery.rows[0];
            const produtosFormatados: VisualizarProduto2 = {
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
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar produtos"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);
router.get(
    "",
    async function (_req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();
            const resultadoMarcas = await Query<Marca>(
                bdConn,
                "SELECT * FROM marca;",
                []
            );

            const resultQuery = await Query<Produto>(
                bdConn,
                "SELECT * FROM produto;",
                []
            );

            const resultadoNomes = await Query<Nome>(
                bdConn,
                "SELECT * FROM nome;",
                []
            );

            const produtosFormatados: VisualizarProduto[] = resultQuery.rows.map((produto: Produto) => {
                const marcaProduto: Marca = produto.id_marca
                    ? resultadoMarcas.rows.find((marca: Marca) => marca.id === produto.id_marca)
                    : undefined;

                const nomesProduto = resultadoNomes.rows
                    .filter((nome: Nome) => nome.id_produto === produto.id)
                    .map((nome: NomeVisualizar) => ({
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
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar produtos"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);

router.patch(
    "/:id",
    async function (req: Request, res: Response) {
        const { id } = req.params;
        const {
            nomes,
            marca,
            garantia,
            validade,
            preco
        } = req.body as AtualizarProduto;

        let bdConn: Pool | null = null;
        try {
            let id_marca: number | null = null;

            bdConn = await StartConnection();
            if (typeof marca === "string") {
                try {
                    const resultadoMarca = await Query(
                        bdConn,
                        "INSERT INTO marca (nome) VALUES ($1) RETURNING id;",
                        [marca]
                    );
                    id_marca = resultadoMarca.rows[0].id;
                } catch (err) {
                    const retorno = {
                        errors: [(err as Error).message],
                        msg: ["Falha ao cadastrar marca"],
                        data: null,
                    } as RespostaPadrao;
                    res.status(500).send(retorno);
                }
            } else if (typeof marca === "number") {
                id_marca = marca;
            };

            let valoresQuery: Array<string> = [];
            valoresQuery.push(`id_marca = '${id_marca}'`);
            if (garantia !== undefined) valoresQuery.push(`garantia = '${garantia}'`);
            if (validade !== undefined) valoresQuery.push(`validade = '${validade}'`);
            else valoresQuery.push(`validade = Null`);
            if (preco !== undefined) valoresQuery.push(`preco = '${preco}'`);

            await Query<AtualizarProduto>(
                bdConn,
                `UPDATE produto SET ${valoresQuery.join(", ")} WHERE id = $1;`,
                [id]
            );

            const resultNomes = await Query(
                bdConn,
                "SELECT id, nome FROM nome WHERE id_produto = $1;",
                [id]
            );

            const nomesAtuais = resultNomes.rows;
            let nomesParaRemover = [...nomesAtuais];

            for (const nome of nomes) {
                const nomeExistente = nomesAtuais.find(
                    (no: NomeAtualizar) => no.nome === nome
                );

                if (nomeExistente) {
                    nomesParaRemover = nomesParaRemover.filter(it => it.id !== nomeExistente.id);
                } else {
                    try {
                        await Query(
                            bdConn,
                            "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);",
                            [id, nome]
                        );
                    } catch (err) {
                        const retorno = {
                            errors: [(err as Error).message],
                            msg: ["Falha ao cadastrar nome"],
                            data: null,
                        } as RespostaPadrao;
                        return res.status(500).send(retorno);
                    }

                }

                for (const nomeParaRemover of nomesParaRemover) {
                    await Query(
                        bdConn,
                        `DELETE FROM nome WHERE id = $1;`,
                        [nomeParaRemover.id]
                    );
                };
            };

            const retorno = {
                errors: [],
                msg: ["Produto atualizado com sucesso"],
                data: null,
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao cadastrar produto"],
                data: null,
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);

router.delete(
    "/:id",
    async function (req: Request, res: Response) {
        const { id } = req.params;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query(
                bdConn,
                "DELETE FROM produto WHERE id = $1;",
                [id]
            );

            const retorno = {
                errors: [],
                msg: ["Produto deletado com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send({
                errors: [(err as Error).message],
                msg: "Falha ao deletar o produto"
            });
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);

export {
    router as ProdutoRouter
};