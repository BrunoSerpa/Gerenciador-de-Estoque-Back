import { AtualizarItem, CadastrarItem, VisualizarItem2 } from "./Item";

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

interface AtualizarCadastro {
    data_cadastro: Date;
    frete: number;
    titulo: string;
    itens: AtualizarItem[];
};

interface VisualizarCadastro {
    id: number;
    data_cadastro: Date;
    titulo: string;
    custo_itens: number;
    total: number;
};

interface VisualizarCadastro2 {
    data_cadastro: Date;
    frete: number;
    titulo: string;
    itens: VisualizarItem2[]
};

export { AtualizarCadastro, Cadastro, CadastrarCadastro, VisualizarCadastro, VisualizarCadastro2 }