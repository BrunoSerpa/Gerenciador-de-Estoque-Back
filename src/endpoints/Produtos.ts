import express, { Request, Response } from "express";
import { StartConnection, EndConnection, Query } from "../services/postgres";
import { Pool } from "pg";
import { Produto, ProdutoCadastrar, ProdutoVisualisar } from "../types/Produto";
import { RespostaPadrao } from "../types/Response";
import { Marca } from "../types/Marca";
import { Nome, NomeVisualizar } from "../types/Nome";

const router = express.Router();

router.post(
    "",
    async function (req: Request, res: Response) {
        const { nomes, marca, garantia, validade, preco } = req.body as ProdutoCadastrar;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            let id_marca: number | null = null;
            if (typeof marca === "string") {
                const resultMarca = await Query(
                    bdConn,
                    "INSERT INTO marca (nome) VALUES ($1) RETURNING id;",
                    [marca]
                );
                id_marca = resultMarca.rows[0].id;
            } else if (typeof marca === "number") {
                id_marca = marca;
            };

            const resultadoProduto = await Query(
                bdConn,
                "INSERT INTO produto (id_marca, garantia, validade, preco, quantidade) VALUES ($1, $2, $3, $4, 0) RETURNING id;",
                [id_marca, garantia, validade, preco]
            );

            const id_produto = resultadoProduto.rows[0].id;
            if (nomes) {
                for (const nome of nomes) {
                    await Query(
                        bdConn,
                        "INSERT INTO nome (id_produto, nome) VALUES ($1, $2);",
                        [id_produto, nome]
                    );
                };
            };

            const retorno = {
                errors: [],
                msg: ["Produto cadastrado com sucesso"],
                data: resultadoProduto.rows,
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
    "",
    async function (req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();
            const marcas = await Query<Marca>(
                bdConn,
                "SELECT * FROM marca;",
                []
            );

            const produtos = await Query<Produto>(
                bdConn,
                "SELECT * FROM produto;",
                []
            );

            const nomes = await Query<Nome>(
                bdConn,
                "SELECT * FROM nome;",
                []
            );

            const produtosFormatados: ProdutoVisualisar[] = produtos.rows.map((produto: Produto) => {
                const marcaProduto: Marca = produto.id_marca
                    ? marcas.rows.find((marca: Marca) => marca.id === produto.id_marca)
                    : undefined;

                const nomesProduto = nomes.rows
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
            res.status(200).send(produtosFormatados);
        } catch (err) {
            res.status(500).send(err);
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

            const produtoExistente = await Query(
                bdConn,
                "SELECT * FROM produto WHERE id = $1;",
                [id]
            );

            if (produtoExistente.rows.length === 0) {
                return res.status(404).send({
                    errors: ["Produto não encontrado"],
                    msg: "Nenhum produto foi encontrado com o ID fornecido."
                });
            };

            await Query(
                bdConn,
                "DELETE FROM produto WHERE id = $1;",
                [id]
            );

            res.status(200).send({
                errors: [],
                msg: `Produto com ID ${id} deletado com sucesso.`
            });
        } catch (err) {
            res.status(500).send({
                errors: [(err as Error).message],
                msg: "Falha ao deletar o produto."
            });
        } finally {
            if (bdConn) EndConnection(bdConn);
        };
    }
);

export {
    router as ProdutoRouter
};