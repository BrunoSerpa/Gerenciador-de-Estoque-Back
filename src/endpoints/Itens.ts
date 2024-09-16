import express, { Request, Response } from "express";
import { StartConnection, EndConnection, Query } from "../services/postgres";
import { Pool } from "pg";
import { Item, ItemVisualizar } from "../types/Item";
const router = express.Router();

router.get(
    "/:id",
    async function (req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            const { id } = req.params
            bdConn = await StartConnection();
            const itens = await Query<Item>(
                bdConn,
                "SELECT id, data_compra, preco::numeric from item WHERE id_produto = $1;",
                [id]
            );

            const itensFormatados: ItemVisualizar[] = itens.rows.map((item: Item) => {
                return {
                    id: item.id,
                    data_compra: item.data_compra,
                    preco: Number(item.preco)
                };
            });

            res.status(200).send(itensFormatados);
        } catch (err) {
            res.status(500).send(err);
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

            const itemExistente = await Query(
                bdConn,
                "SELECT * FROM item WHERE id = $1;",
                [id]
            );

            if (itemExistente.rows.length === 0) {
                return res.status(404).send({
                    errors: ["Item não encontrado"],
                    msg: "Nenhum item foi encontrado com o ID fornecido."
                });
            }

            await Query(
                bdConn,
                "DELETE FROM item WHERE id = $1;",
                [id]
            );

            res.status(200).send({
                errors: [],
                msg: `Item com ID ${id} deletado com sucesso.`
            });
        } catch (err) {
            res.status(500).send({
                errors: [(err as Error).message],
                msg: "Falha ao deletar o item."
            });
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as ItemRouter
};