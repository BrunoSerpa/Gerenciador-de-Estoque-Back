import { CadastrarItem } from "./Item";

interface Cadastro {
    id: number;
    data_cadastro: Date;
    frete?: number;
    titulo?: string;
    custo_itens: number;
};

interface CadastrarCadastro {
    data_cadastro: Date;
    frete: number;
    titulo: string;
    itens: CadastrarItem[];
};

interface VisualizarCadastro {
    id: number;
    data_cadastro: Date;
    titulo: string;
    custo_itens: number;
    total: number;
};

export { Cadastro, CadastrarCadastro, VisualizarCadastro }