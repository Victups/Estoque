# 📦 Sistema de Gestão de Estoque

Sistema completo de gestão de estoque desenvolvido com Vue 3, Vuetify 3 e TypeScript. Interface moderna e responsiva para controle de produtos, movimentações, relatórios e usuários.

## 🚀 Tecnologias

- **Frontend**: Vue 3 + Composition API
- **UI Framework**: Vuetify 3
- **Linguagem**: TypeScript
- **Estado**: Pinia
- **Roteamento**: Vue Router
- **Build Tool**: Vite
- **Mock API**: json-server
- **Banco de Dados**: PostgreSQL (schema disponível)

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com email/senha
- Seleção de UF (Unidade Federativa)
- Controle de sessão com localStorage
- Diferentes níveis de acesso (admin, gestor, estoquista, relatórios)

### 📦 Gestão de Produtos
- Cadastro completo de produtos
- Categorias e marcas
- Unidades de medida
- Produtos perecíveis com data de validade
- Preço de custo e venda por lote
- Códigos automáticos (PROD001, PROD002...)

### 📋 Gestão de Lotes
- Controle de lotes por produto
- Data de entrada e validade
- Localização física (depósito, corredor, prateleira)
- Quantidade em estoque
- Códigos automáticos (L001, L002...)

### 🔄 Movimentações
- Entrada e saída de produtos
- Seleção automática de lotes (FIFO)
- Preenchimento automático de dados
- Formatação de valores monetários
- Validação de estoque mínimo

### 📊 Relatórios
- Gráficos de distribuição por categoria
- Movimentações dos últimos 7 dias
- Análise de estoque por produto
- Filtros avançados
- Interface dark theme

### 👥 Gestão de Usuários
- Cadastro e edição de usuários
- Controle de roles e permissões
- Vinculação com contatos
- Endereços completos

### 🏢 Localização
- Estados (UF)
- Municípios
- Endereços completos
- Depósitos e localizações físicas

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- npm/yarn/pnpm

### Passos

1. **Clone o repositório**
```bash
git clone <https://github.com/Victups/Estoque.git>
cd estoque
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. **Inicie o mock API (em outro terminal)**
```bash
npm run json-server
# ou
yarn json-server
# ou
pnpm json-server
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── DonutChartCard.vue
│   ├── GraficoBarrasCompleto.vue
│   ├── FiltrosRelatorios.vue
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Login.vue
│   ├── Produtos.vue
│   ├── Movimentacao.vue
│   ├── Relatorios.vue
│   └── ...
├── services/           # Serviços de API
│   ├── api.config.ts
│   ├── product.service.ts
│   ├── movement.service.ts
│   └── ...
├── stores/             # Estado global (Pinia)
│   ├── auth.ts
│   ├── produtosCache.ts
│   └── ...
├── types/              # Definições TypeScript
│   └── index.ts
├── composables/        # Composables Vue 3
│   ├── useFormValidation.ts
│   ├── useSnackbar.ts
│   └── ...
└── router/             # Configuração de rotas
    └── index.ts

db/
└── db.json            # Mock database
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev            # Servidor de desenvolvimento
npm run json-server    # Mock API (porta 3001)

# Build
npm run build          # Build para produção
npm run preview        # Preview do build

# Qualidade de código
npm run lint           # ESLint
npm run type-check     # Verificação TypeScript
```

## 🗄️ Banco de Dados

### Schema PostgreSQL
O projeto inclui o schema completo do banco PostgreSQL com:
- Tabelas principais (produtos, lotes, movimentações, usuários)
- Relacionamentos e foreign keys
- Triggers para geração automática de códigos
- Constraints de validação
- Índices para performance

### Mock Database
Durante o desenvolvimento, o sistema usa `db.json` como mock:
- Dados de exemplo para todas as entidades
- Endpoints REST simulados via json-server
- Estrutura idêntica ao banco real

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# .env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=Sistema de Estoque
```

### json-server
```json
// json-server.json
{
  "id": "id",
  "port": 3001,
  "noCors": false,
  "readOnly": false
}
```

## 📱 Interface

### Design System
- **Tema**: Dark mode por padrão
- **Cores**: Paleta consistente com Vuetify
- **Tipografia**: Roboto (padrão Vuetify)
- **Ícones**: Material Design Icons
- **Layout**: Responsivo com breakpoints

### Componentes Principais
- **Charts**: ApexCharts integrado
- **Forms**: Validação em tempo real
- **Tables**: Data tables com paginação
- **Dialogs**: Modais para CRUD
- **Snackbars**: Notificações de feedback

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Deploy Estático
O projeto pode ser deployado em qualquer serviço de hospedagem estática:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop da pasta `dist`
- **GitHub Pages**: Configurar workflow
- **Firebase Hosting**: `firebase deploy`

## 🔮 Próximos Passos

### Backend (Futuro)
- API REST com PHP Laravel 
- Autenticação JWT
- Validação de permissões
- Auditoria de ações
- Integração com banco real

### Funcionalidades Adicionais
- Dashboard com métricas
- Relatórios avançados
- Notificações push
- Integração com APIs externas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Frontend Vue 3 + TypeScript
- **Design**: Vuetify 3 + Material Design
- **Arquitetura**: SPA com Mock API

---

**Desenvolvido com ❤️ usando Vue 3 + Vuetify 3**