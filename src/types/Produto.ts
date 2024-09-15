import { NomeVisualizar } from "./Nome";
import { Marca } from "./Marca";

interface Produto {
    id: number;
    id_marca?: number;
    garantia: number;
    validade?: number;
    preco: number;
    quantidade: number;
};

interface ProdutoCadastrar {
    nomes: string[];
    marca?: number | string;
    garantia: number;
    preco: number;
    validade?: number;
};

interface ProdutoVisualisar {
    id: number;
    nomes: NomeVisualizar[];
    garantia: number;
    validade?: number;
    preco: number;
    quantidade: number;
    marca?: Marca;
};

export { Produto, ProdutoCadastrar, ProdutoVisualisar };