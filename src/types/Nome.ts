interface Nome {
    id: number;
    id_produto: number;
    nome: string;
};

interface NomeAtualizar {
    id: number;
    nome: string;
};

interface NomeVisualizar {
    id: number;
    nome: string;
};

export { Nome, NomeAtualizar, NomeVisualizar };