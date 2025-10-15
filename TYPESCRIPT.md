# 📘 Guia TypeScript do Projeto

Este projeto foi refatorado para usar **TypeScript forte**, eliminando o uso de `any` e implementando tipagem completa.

## 🏗️ Estrutura de Tipos

### 📁 `/src/types/index.ts`
Arquivo central com todas as interfaces e tipos do sistema:

#### **Tipos de Usuário**
```typescript
interface User {
  id: number
  name: string
  email: string
  role: UserRole
  department: Department
  status: UserStatus
  lastAccess: string
  initials: string
  avatarColor: string
}

interface BackendUser {
  id: number
  nome: string
  email: string
  senha?: string
  id_contato: number
}

type UserRole = 'Admin' | 'Gerente' | 'Operador' | 'Visualizador'
type UserStatus = 'Ativo' | 'Inativo'
type Department = 'TI' | 'Gestão' | 'Estoque' | 'Vendas' | 'Financeiro' | 'Geral'
```

#### **Tipos de Produto**
- `Product`: Produto completo
- `ProductLote`: Lote de produto
- `Category`: Categoria
- `Brand`: Marca
- `UnitMeasure`: Unidade de medida

#### **Outros Tipos**
- Localização (`Location`, `Deposit`)
- Movimentação (`StockMovement`)
- Contato (`Contact`)
- Endereço (`Address`, `Municipality`, `State`)
- Fornecedor (`Supplier`)

## 🔧 Serviços (Services)

### 📁 `/src/services/api.ts`

#### **UserService**
Serviço tipado para operações com usuários:

```typescript
// Buscar todos os usuários
const users = await UserService.getAll()  // BackendUser[]

// Buscar por ID
const user = await UserService.getById(1)  // BackendUser | undefined

// Criar usuário
const newUser = await UserService.create({
  nome: 'João Silva',
  email: 'joao@email.com',
  senha: '123456',
  id_contato: 1
})  // BackendUser

// Atualizar usuário
await UserService.update(1, {
  nome: 'João Silva Atualizado',
  email: 'joao.novo@email.com'
})

// Deletar usuário
await UserService.delete(1)

// Verificar se email existe
const exists = await UserService.emailExists('joao@email.com')  // boolean
```

#### **ArrayResponse**
Classe helper para lidar com arrays aninhados do json-server:

```typescript
const data = await response.json()
const arrayResponse = new ArrayResponse<BackendUser>(data)
const users = arrayResponse.get()  // BackendUser[]
```

## 🎯 Composables

### 📁 `/src/composables/useUser.ts`

Funções reutilizáveis para manipulação de usuários:

```typescript
const { 
  getInitials,           // Gera iniciais do nome
  determineRole,         // Determina role baseado no nome
  determineDepartment,   // Determina departamento
  getAvatarColor,        // Gera cor do avatar
  getRoleColor,          // Retorna cor da role
  getRoleIcon,           // Retorna ícone da role
  mapBackendToUser       // Converte BackendUser -> User
} = useUser()

const {
  activeUsers,           // Lista de usuários ativos
  inactiveUsers,         // Lista de usuários inativos
  adminUsers,            // Lista de admins
  totalUsers,            // Total de usuários
  activeUsersCount,      // Contagem de ativos
  inactiveUsersCount,    // Contagem de inativos
  adminCount             // Contagem de admins
} = useUserStats(users)
```

### 📁 `/src/composables/useSnackbar.ts`

Sistema tipado de notificações:

```typescript
const {
  snackbar,              // ref<boolean>
  snackbarText,          // ref<string>
  snackbarColor,         // ref<SnackbarColor>
  snackbarTimeout,       // ref<number>
  showSnackbar,          // Mostrar notificação customizada
  showSuccess,           // Mostrar sucesso
  showError,             // Mostrar erro
  showWarning,           // Mostrar aviso
  showInfo,              // Mostrar info
  hide                   // Esconder
} = useSnackbar()

// Uso
showSuccess('Operação realizada com sucesso!')
showError('Erro ao processar')
```

### 📁 `/src/composables/useFormValidation.ts`

Regras de validação reutilizáveis:

```typescript
const {
  required,              // Campo obrigatório
  email,                 // Validação de email
  minLength,             // Tamanho mínimo
  maxLength,             // Tamanho máximo
  passwordMatch,         // Senhas coincidem
  phone,                 // Telefone válido
  cpf,                   // CPF válido
  cnpj,                  // CNPJ válido
  numeric,               // Apenas números
  positive,              // Número positivo
  url                    // URL válida
} = useFormValidation()

// Uso em formulários
const rules = {
  name: [required, minLength(3)],
  email: [required, email],
  password: [required, minLength(6)],
  confirmPassword: [required, passwordMatch(password)]
}
```

## 📄 Exemplo de Uso Completo

### UserManagementPageTyped.vue

```typescript
import type { User } from '@/types'
import { UserService } from '@/services/api'
import { useUser, useUserStats } from '@/composables/useUser'
import { useSnackbar } from '@/composables/useSnackbar'

const userHelpers = useUser()
const snackbar = useSnackbar()
const users = ref<User[]>([])
const stats = useUserStats(users)

async function loadUsers (): Promise<void> {
  try {
    const backendUsers = await UserService.getAll()
    users.value = backendUsers.map(userHelpers.mapBackendToUser)
    snackbar.showSuccess('Usuários carregados!')
  } catch (error: unknown) {
    snackbar.showError('Erro ao carregar usuários')
  }
}
```

## ✅ Benefícios

1. **Type Safety**: Erros capturados em tempo de compilação
2. **IntelliSense**: Autocomplete completo no editor
3. **Refatoração Segura**: Mudanças propagam automaticamente
4. **Documentação**: Código auto-documentado
5. **Manutenibilidade**: Mais fácil de manter e estender
6. **Reutilização**: Composables e serviços compartilhados

## 🔄 Migração de Código Existente

### Antes (JavaScript/any)
```typescript
const users = ref([])
function getUsers() {
  fetch('url')
    .then(res => res.json())
    .then(data => users.value = data)
}
```

### Depois (TypeScript Tipado)
```typescript
const users = ref<User[]>([])
async function getUsers(): Promise<void> {
  try {
    const backendUsers = await UserService.getAll()
    users.value = backendUsers.map(userHelpers.mapBackendToUser)
  } catch (error: unknown) {
    console.error('Erro:', error)
  }
}
```

## 📚 Referências

- **Tipos**: `/src/types/index.ts`
- **Serviços**: `/src/services/api.ts`
- **Composables**: `/src/composables/`
- **Exemplo Completo**: `/src/pages/UserManagementPageTyped.vue`

---

**Nota**: Os arquivos antigos ainda existem para referência. A migração deve ser feita gradualmente para evitar quebrar funcionalidades existentes.

