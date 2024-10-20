import { AtualizarItem, CadastrarItem, VisualizarItem2 } from "./Item";

interface Cadastro {
    id: number;
    custo_itens: number;
    data_cadastro: Date;
    frete?: number;
    titulo?: string;
};

interface CadastrarCadastro {
    data_cadastro: Date;
    frete?: number;
    itens: CadastrarItem[];
    titulo?: string;
};

interface AtualizarCadastro {
    data_cadastro: Date;
    frete?: number;
    itens: AtualizarItem[];
    titulo?: string;
};

interface VisualizarCadastro {
    id: number;
    data_cadastro: Date;
    titulo: string;
    total: number;
};

interface VisualizarCadastro2 {
    data_cadastro: Date;
    frete: number;
    itens: VisualizarItem2[]
    titulo: string;
};

export { AtualizarCadastro, Cadastro, CadastrarCadastro, VisualizarCadastro, VisualizarCadastro2 }