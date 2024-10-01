import express, { Request, Response } from "express";
import { Pool } from "pg";

import { StartConnection, EndConnection, Query } from "../services/postgres";

import { CadastrarCadastro, Cadastro, VisualizarCadastro } from "../types/Cadastro";
import { RespostaPadrao } from "../types/Response";

const router = express.Router();

router.post(
    "",
    async function (req: Request, res: Response) {
        const {
            data_cadastro,
            frete,
            titulo,
            itens
        } = req.body as CadastrarCadastro;

        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();

            const resultadoCadastro = await Query(
                bdConn,
                `INSERT INTO cadastro (data_cadastro, frete, titulo, custo_itens) 
                VALUES ($1, $2, $3, 0) RETURNING id;`,
                [data_cadastro, frete, titulo]
            );

            const id_cadastro = resultadoCadastro.rows[0].id;

            try {
                for (const item of itens) {
                    await Query(
                        bdConn,
                        `INSERT INTO item (id_cadastro, id_produto, data_compra, preco) 
                        VALUES ($1, $2, $3, $4);`,
                        [id_cadastro, item.id_produto, data_cadastro, item.preco]
                    );
                }

                const retorno = {
                    errors: [],
                    msg: ["Cadastro cadastrada com sucesso"],
                    data: resultadoCadastro.rows[0],
                } as RespostaPadrao;
                res.status(200).send(retorno);
            } catch (err) {
                const retorno = {
                    errors: [(err as Error).message],
                    msg: ["Falha ao cadastrar itens"],
                    data: null,
                } as RespostaPadrao;
                res.status(500).send(retorno);
            }
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao cadastrar cadastro"],
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

            const resultQuery = await Query<Cadastro>(
                bdConn,
                "SELECT id, data_cadastro, titulo, frete::numeric, custo_itens::numeric from cadastro;",
                []
            );

            const cadastrosFormatadas: VisualizarCadastro[] = resultQuery.rows.map((cadastro: Cadastro) => {
                return {
                    id: cadastro.id,
                    data_cadastro: cadastro.data_cadastro,
                    titulo: cadastro.titulo || undefined,
                    total: cadastro.frete ? Number(cadastro.custo_itens) + Number(cadastro.frete) : Number(cadastro.custo_itens)
                };
            });

            const retorno = {
                errors: [],
                msg: ["Cadastros listados com sucesso"],
                data: {
                    rows: cadastrosFormatadas,
                    fields: resultQuery.fields
                }
            } as RespostaPadrao;
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao listar cadastros"],
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
                "DELETE FROM cadastro WHERE id = $1;",
                [id]
            );

            const retorno = {
                errors: [],
                msg: ["Cadastro deletado com sucesso"],
                data: {
                    rows: resultQuery.rows,
                    fields: resultQuery.fields
                }
            };
            res.status(200).send(retorno);
        } catch (err) {
            const retorno = {
                errors: [(err as Error).message],
                msg: ["Falha ao deletar o cadastro"],
                data: null
            };
            res.status(500).send(retorno);
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as CadastroRouter
};