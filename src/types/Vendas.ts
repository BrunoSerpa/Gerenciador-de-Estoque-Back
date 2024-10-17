import { AtualizarItem, CadastrarItem, VisualizarItem2 } from "./Item";

interface Venda {
    id: number;
    data_venda: Date;
    frete?: number;
    titulo?: string;
    custo_itens: number;
};

interface CadastrarVenda {
    data_venda: Date;
    frete: number;
    titulo: string;
    itens: CadastrarItem[];
};

interface AtualizarVenda {
    data_venda: Date;
    frete: number;
    titulo: string;
    itens: AtualizarItem[];
};

interface VisualizarVenda {
    id: number;
    data_venda: Date;
    titulo: string;
    custo_itens: number;
    total: number;
};

interface VisualizarVenda2 {
    data_venda: Date;
    frete: number;
    titulo: string;
    itens: VisualizarItem2[]
};

export { AtualizarVenda, Venda, CadastrarVenda, VisualizarVenda, VisualizarVenda2 }