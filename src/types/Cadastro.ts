import { ItemCadastrar } from "./Item";

interface Cadastro {
    id: number;
    data_cadastro: Date;
    frete?: number;
    titulo?: string;
    custo_itens: number;
};

interface CadastroCadastrar {
    data_cadastro: Date;
    frete: number;
    titulo: string;
    itens: ItemCadastrar[];
};

interface CadastroVisualizar {
    id: number;
    data_cadastro: Date;
    titulo: string;
    custo_itens: number;
    total: number;
};

export { Cadastro, CadastroCadastrar, CadastroVisualizar }