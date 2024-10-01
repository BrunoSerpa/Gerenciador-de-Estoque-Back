import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";

import { RespostaPadrao } from "../types/Response";
import { Nome } from "../types/Nome";

const router = express.Router();

router.get(
    "",
    async function (_req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultQuery = await Query<Nome>(
                bdConn,
                "SELECT * from nome;",
                []
            );

            const retorno = {
                errors: [],
                msg: ["Nomes listados com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar nomes"],
                data: null
            } as RespostaPadrao;
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as NomesRouter
};