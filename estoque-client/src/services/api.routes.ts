export const API_ROUTES = {

  auth: {
    login: '/auth/login',
  },


  usuarios: {
    base: '/usuarios',
    byId: (id: number) => `/usuarios/${id}`,
    stats: '/usuarios/stats',
  },

 
  produtos: {
    base: '/produtos',
    byId: (id: number) => `/produtos/${id}`,
    estoqueByProduto: (id: number) => `/produtos/${id}/estoque`,
    estoqueBaixo: '/produtos/estoque-baixo',
  },

  produtoFornecedor: {
    base: '/produto-fornecedor',
    byId: (id: number) => `/produto-fornecedor/${id}`,
    byProduto: (idProduto: number) => `/produto-fornecedor?produto=${idProduto}`,
  },

  
  categorias: {
    base: '/categorias',
    byId: (id: number) => `/categorias/${id}`,
  },


  marcas: {
    base: '/marcas',
    byId: (id: number) => `/marcas/${id}`,
  },

 
  unidades: {
    base: '/unidades',
    byId: (id: number) => `/unidades/${id}`,
  },

  
  fornecedores: {
    base: '/fornecedores',
    byId: (id: number) => `/fornecedores/${id}`,
  },


  contatos: {
    base: '/contatos',
    byId: (id: number) => `/contatos/${id}`,
  },

  
  estoques: {
    base: '/estoques',
    byId: (id: number) => `/estoques/${id}`,
  },

  
  lotes: {
    base: '/lotes',
    byId: (id: number) => `/lotes/${id}`,
    byProduto: (idProduto: number) => `/lotes?produto=${idProduto}`,
    vencendoProximo: (dias?: number) => `/lotes/vencendo-proximo${dias ? `?dias=${dias}` : ''}`,
  },

  
  locais: {
    base: '/locais',
    byId: (id: number) => `/locais/${id}`,
  },

  
  depositos: {
    base: '/depositos',
    byId: (id: number) => `/depositos/${id}`,
  },

 
  enderecos: {
    base: '/enderecos',
    byId: (id: number) => `/enderecos/${id}`,
  },

  
  uf: {
    base: '/uf',
  },

  
  municipios: {
    base: '/municipios',
    byUf: (idUf: number) => `/municipios/uf/${idUf}`,
  },

  
  dashboards: {
    base: '/dashboards',
    stats: '/dashboards/stats',
  },
} as const

