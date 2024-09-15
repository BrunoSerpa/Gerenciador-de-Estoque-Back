interface Item {
    id: number;
    id_cadastro: number;
    id_produto: number;
    data_compra: Date;
    preco: number;
};

interface ItemCadastrar {
    id_produto: number;
    preco: number;
};

export { Item, ItemCadastrar };