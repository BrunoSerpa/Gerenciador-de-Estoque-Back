import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";
import { RespostaPadrao } from "../types/Response";
import { AtualizarVenda, CadastrarVenda, Venda, VisualizarVenda, VisualizarVenda2 } from "../types/Vendas";
import { VisualizarItem2 } from "../types/Item";

const router = express.Router();

router.post(
    "",
    async function (req: Request, res: Response) {
        const {
            data_venda,
            frete,
            titulo,
            itens
        } = req.body as CadastrarVenda;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultadoVenda = await Query(
                bdConn,
                `INSERT INTO venda (data_venda, frete, titulo, custo_itens) 
                VALUES ($1, $2, $3, 0) RETURNING id;`,
                [data_venda, frete ?? null, titulo ?? null]
            );

            const id_venda = resultadoVenda.rows[0].id;

            try {
                for (const item of itens) {
                    const resultadoItem = await Query(
                        bdConn,
                        `SELECT id FROM item WHERE id_produto = $1 AND id_venda IS NULL ORDER BY data_compra ASC LIMIT 1;`,
                        [item.id_produto]
                    );

                    if (resultadoItem.rows.length === 0) {
                        throw new Error(`Produto com ID ${item.id_produto} não disponível para venda.`);
                    }

                    const id_item = resultadoItem.rows[0].id;

                    await Query(
                        bdConn,
                        `UPDATE item SET id_venda = $1, preco_venda = $2 WHERE id = $3;`,
                        [id_venda, item.preco, id_item]
                    );
                }

                const retorno = {
                    errors: [],
                    msg: ["Venda cadastrada com sucesso"],
                    data: resultadoVenda.rows[0],
                } as RespostaPadrao;
                res.status(200).send(retorno);
            } catch (itemError) {
                await Query(
                    bdConn,
                    `DELETE FROM venda WHERE id = $1;`,
                    [id_venda]
                );

                const retorno = {
                    errors: [(itemError as Error).message],
                    msg: ["Falha ao cadastrar itens na venda"],
                    data: null,
                } as RespostaPadrao;

                res.status(500).send(retorno);
            }
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao cadastrar venda"],
                data: null,
            } as RespostaPadrao;

            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

router.get(
    "",
    async function (_req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query<Venda>(
                bdConn,
                "SELECT id, data_venda, titulo, frete::numeric, custo_itens::numeric FROM venda;",
                []
            );

            const vendasFormatadas: VisualizarVenda[] = resultQuery.rows.map((venda: Venda) => {
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
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar vendas"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

router.get(
    "/:id",
    async function (req: Request, res: Response) {
        const { id } = req.params;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query<Venda>(
                bdConn,
                "SELECT id, data_venda, titulo, frete::numeric FROM venda WHERE id = $1;",
                [id]
            );

            const resultQueryItens = await Query<VisualizarItem2>(
                bdConn,
                "SELECT id_produto, preco_venda::numeric, COUNT(*) as quantidade FROM item WHERE id_venda = $1 GROUP BY id_produto, preco_venda;",
                [id]
            );

            const vendaFormatada: VisualizarVenda2[] = resultQuery.rows.map((venda: Venda) => {
                return {
                    id: venda.id,
                    data_venda: venda.data_venda,
                    frete: venda.frete,
                    titulo: venda.titulo,
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
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao visualizar venda"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

router.patch(
    "/:id",
    async function (req: Request, res: Response) {
        const {
            data_venda,
            frete,
            itens,
            titulo
        } = req.body as AtualizarVenda;

        const { id } = req.params;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const itensResult = await Query(
                bdConn,
                `SELECT id, id_produto, preco_venda FROM item WHERE id_venda = $1;`,
                [id]
            );

            const queries: Array<{ query: string; params: any[] }> = [];
            const itens_excluidos = itensResult.rows;

            for (const item of itens) {
                let resultadoItem = itens_excluidos.find((it: {id_produto: number}) => it.id_produto === item.id_produto);

                if (resultadoItem) {
                    queries.push({
                        query: `UPDATE item SET preco_venda = $1 WHERE id = $2;`,
                        params: [item.preco, resultadoItem.id]
                    });

                    const index = itens_excluidos.indexOf(resultadoItem);
                    if (index !== -1) itens_excluidos.splice(index, 1);
                } else {
                    const resultadoItemDisponivel = await Query(
                        bdConn,
                        `SELECT id FROM item 
                         WHERE id_produto = $1 AND id_venda IS NULL 
                         ORDER BY data_compra ASC 
                         LIMIT 1;`,
                        [item.id_produto]
                    );

                    if (resultadoItemDisponivel.rows.length === 0) {
                        throw new Error(`Produto com ID ${item.id_produto} não disponível para venda.`);
                    }

                    const id_item = resultadoItemDisponivel.rows[0].id;

                    queries.push({
                        query: `UPDATE item SET id_venda = $1, preco_venda = $2 WHERE id = $3;`,
                        params: [id, item.preco, id_item]
                    });
                }
            }

            for (const item of itens_excluidos) {
                queries.push({
                    query: `UPDATE item SET id_venda = NULL, preco_venda = NULL WHERE id = $1;`,
                    params: [item.id]
                });
            }

            for (const { query, params } of queries) {
                await Query(bdConn, query, params);
            }

            let valoresQuery: Array<string> = [];
            if (data_venda !== undefined) valoresQuery.push(`data_venda = '${data_venda}'`);
            if (frete !== undefined) valoresQuery.push(`frete = '${frete}'`);
            else valoresQuery.push(`frete = NULL`);
            if (titulo !== undefined) valoresQuery.push(`titulo = '${titulo}'`);
            else valoresQuery.push(`titulo = NULL`);

            await Query(
                bdConn,
                `UPDATE venda SET ${valoresQuery.join(", ")} WHERE id = ${id};`,
                []
            );

            const retorno = {
                errors: [],
                msg: ["Venda atualizada com sucesso"],
                data: null,
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao atualizar venda"],
                data: null,
            } as RespostaPadrao;

            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

router.delete(
    "/:id",
    async function (req: Request, res: Response) {
        const { id } = req.params;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            await Query(
                bdConn,
                "DELETE FROM venda WHERE id = $1;",
                [id]
            );

            const retorno = {
                errors: [],
                msg: ["Venda deletada com sucesso"],
                data: null
            };
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao deletar a venda"],
                data: null
            };
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as VendaRouter
};