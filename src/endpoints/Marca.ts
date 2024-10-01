import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";

import { Marca } from "../types/Marca";
import { RespostaPadrao } from "../types/Response";

const router = express.Router();

router.get(
    "",
    async function (_req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query<Marca>(
                bdConn,
                "SELECT * from marca;",
                []
            );

            const retorno = {
                errors: [],
                msg: ["Marcas listadas com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar marcas"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }

    }
);

export {
    router as MarcaRouter
};