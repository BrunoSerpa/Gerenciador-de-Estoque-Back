interface Item {
    id: number;
    id_cadastro: number;
    id_produto: number;
    data_compra: Date;
    preco: number;
};

interface AtualizarItem {
    id_produto: number;
    preco: number;
};

interface CadastrarItem {
    id_produto: number;
    preco: number;
};

interface VisualizarItem {
    id: number;
    data_compra: Date;
    preco: number;
};

export { AtualizarItem, CadastrarItem, Item, VisualizarItem };