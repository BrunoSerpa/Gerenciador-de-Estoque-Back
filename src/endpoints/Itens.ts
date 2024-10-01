import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";

import { Item, VisualizarItem } from "../types/Item";
import { RespostaPadrao } from "../types/Response";

const router = express.Router();

router.get(
    "/:id_produto",
    async function (req: Request, res: Response) {
        const { id_produto } = req.params

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query<Item>(
                bdConn,
                "SELECT id, data_cadastro, preco::numeric from item WHERE id_produto = $1;",
                [id_produto]
            );

            const itensFormatados: VisualizarItem[] = resultQuery.rows.map((item: Item) => {
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
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar itens"],
                data: null
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


            const resultQuery = await Query(
                bdConn,
                "DELETE FROM item WHERE id = $1;",
                [id]
            );

            const retorno = {
                errors: [],
                msg: ["Item deletado com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao deletar o item"],
                data: null
            };
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as ItemRouter
};