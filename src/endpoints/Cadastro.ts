import express, { Request, Response } from "express";
import { StartConnection, EndConnection, Query } from "../services/postgres";
import { Pool } from "pg";
import { RespostaPadrao } from "../types/Response";
import { Cadastro, CadastroCadastrar, CadastroVisualizar } from "../types/Cadastro";

const router = express.Router();
router.post(
    "",
    async function (req: Request, res: Response) {
        const {
            data_cadastro,
            frete,
            titulo,
            itens
        } = req.body as CadastroCadastrar;

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
                msg: ["Cadastro cadastrado com sucesso"],
                data: resultadoCadastro.rows,
            } as RespostaPadrao;

            res.status(200).send(retorno);
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
    async function (req: Request, res: Response) {
        let bdConn: Pool | null = null;
        try {
            bdConn = await StartConnection();
            const cadastros = await Query<Cadastro>(
                bdConn,
                "SELECT id, data_cadastro, titulo, frete::numeric, custo_itens::numeric from cadastro;",
                []
            );

            const cadastrosFormatados: CadastroVisualizar[] = cadastros.rows.map((cadastro: Cadastro) => {
                return {
                    id: cadastro.id,
                    data_cadastro: cadastro.data_cadastro,
                    titulo: cadastro.titulo || undefined,
                    total: cadastro.frete ? Number(cadastro.custo_itens) + Number(cadastro.frete) : Number(cadastro.custo_itens)
                };
            });

            res.status(200).send(cadastrosFormatados);
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

            const cadastroExistente = await Query(
                bdConn,
                "SELECT * FROM cadastro WHERE id = $1;",
                [id]
            );

            if (cadastroExistente.rows.length === 0) {
                return res.status(404).send({
                    errors: ["Cadastro não encontrado"],
                    msg: "Nenhum cadastro foi encontrado com o ID fornecido."
                });
            }

            await Query(
                bdConn,
                "DELETE FROM cadastro WHERE id = $1;",
                [id]
            );

            res.status(200).send({
                errors: [],
                msg: `Cadastro com ID ${id} deletado com sucesso.`
            });
        } catch (err) {
            res.status(500).send({
                errors: [(err as Error).message],
                msg: "Falha ao deletar o cadastro."
            });
        } finally {
            if (bdConn) EndConnection(bdConn);
        }
    }
);

export {
    router as CadastroRouter
};