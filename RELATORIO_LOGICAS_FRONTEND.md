# Relatório: Lógicas e Cálculos no Frontend que Devem Estar no Backend

## 🔴 Problemas Críticos Encontrados

### 1. **Cálculo de `valor_total` em Movimentações**
**Localização:**
- `services/movimentacoes/movement.service.ts` (linha 123-125)
- `components/estoques/CreateMovementDialog.vue` (linha 401-402)
- `components/estoques/ViewMovementDialog.vue` (linha 116)
- `components/estoques/MovimentacaoTable.vue` (linha 99)

**Problema:**
```typescript
// ❌ Frontend calculando
valor_total: movementData.preco_unitario === undefined
  ? undefined
  : Number((movementData.preco_unitario * movementData.quantidade).toFixed(2))
```

**Solução:** Backend deve calcular `valor_total` automaticamente ao receber `preco_unitario` e `quantidade`.

---

### 2. **Cálculo de Estoque Total por Produto**
**Localização:**
- `pages/produtos/Produtos.vue` (linha 341)
- `utils/tramposes/reports.ts` (linha 25, 43, 173, 206)

**Problema:**
```typescript
// ❌ Frontend calculando estoque total
const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantidade, 0)
```

**Solução:** Backend deve retornar `estoque_total` já calculado no produto ou criar endpoint específico.

---

### 3. **Estatísticas de Estoque (Dashboard)**
**Localização:**
- `utils/tramposes/reports.ts` (função `calculateStockStats`)

**Problema:**
```typescript
// ❌ Frontend calculando todas as estatísticas
const totalStock = lotes.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
const totalValue = lotes.reduce((sum, lote) =>
  sum + ((lote.quantidade || 0) * (lote.custo_unitario ?? 0)), 0
)
const productsNearExpiration = lotes.filter(...)
const lowStockProducts = products.filter(...)
```

**Solução:** Criar endpoint `/dashboards/stats` no backend que retorne todas essas estatísticas.

---

### 4. **Estatísticas de Usuários**
**Localização:**
- `utils/tramposes/user.ts` (linha 104-117)
- `utils/tramposes/userFilters.ts` (linha 33-34)

**Problema:**
```typescript
// ❌ Frontend calculando estatísticas
const activeUsers = users.filter((u: User) => u.status === 'active')
const inactiveUsers = users.filter((u: User) => u.status === 'inactive')
const adminUsers = users.filter((u: User) => u.role === 'Admin')
```

**Solução:** Criar endpoint `/usuarios/stats` no backend.

---

### 5. **Filtros e Paginação de Produtos**
**Localização:**
- `stores/produtosCache.ts` (linha 114-122)

**Problema:**
```typescript
// ❌ Frontend fazendo filtros e paginação
const filtered = products.filter(p => {
  const byNome = !norm.nome || p.nome.toLowerCase().includes(norm.nome.toLowerCase())
  return byNome
})
const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
const items = filtered.slice(start, start + pageSize)
```

**Solução:** Backend deve aceitar query parameters para filtros e paginação.

---

### 6. **Cálculo de Produtos com Estoque Baixo**
**Localização:**
- `utils/tramposes/reports.ts` (linha 41-45, 165-188)
- `pages/produtos/Produtos.vue` (linha 351)

**Problema:**
```typescript
// ❌ Frontend verificando estoque baixo
const totalQty = productLotes.reduce((sum, l) => sum + (l.quantidade || 0), 0)
return totalQty < (product.estoque_minimo || 0)
```

**Solução:** Backend deve retornar flag `estoque_baixo` ou criar endpoint `/produtos/estoque-baixo`.

---

### 7. **Cálculo de Produtos Próximos ao Vencimento**
**Localização:**
- `utils/tramposes/reports.ts` (linha 30-39)
- `pages/produtos/Produtos.vue` (linha 342-354)

**Problema:**
```typescript
// ❌ Frontend verificando vencimento
const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
const productsNearExpiration = lotes.filter(lote => {
  const expDate = new Date(lote.data_validade)
  return expDate >= today && expDate <= thirtyDaysFromNow
})
```

**Solução:** Backend deve retornar flag `vencimento_proximo` ou criar endpoint `/lotes/vencendo-proximo`.

---

### 8. **Cálculo de Valor por Categoria**
**Localização:**
- `utils/tramposes/reports.ts` (linha 193-214)

**Problema:**
```typescript
// ❌ Frontend calculando valor por categoria
const totalValue = productLotes.reduce((sum, l) =>
  sum + ((l.quantidade || 0) * (l.custo_unitario ?? 0)), 0
)
valueByCategory[catId] = (valueByCategory[catId] || 0) + totalValue
```

**Solução:** Criar endpoint `/dashboards/valor-por-categoria` no backend.

---

### 9. **Cálculo de Produtos por Categoria**
**Localização:**
- `utils/tramposes/reports.ts` (linha 59-73)

**Problema:**
```typescript
// ❌ Frontend contando produtos por categoria
for (const product of products) {
  const catId = product.id_categoria
  productsByCategory[catId] = (productsByCategory[catId] || 0) + 1
}
```

**Solução:** Criar endpoint `/dashboards/produtos-por-categoria` no backend.

---

### 10. **Agregação de Movimentações por Data**
**Localização:**
- `utils/tramposes/reports.ts` (linha 118-150)

**Problema:**
```typescript
// ❌ Frontend agregando movimentações por dia
for (const mov of movements) {
  const movDate = new Date(mov.data_mov).toLocaleDateString(...)
  if (mov.tipo_movimento === 'entrada') {
    entradas[dayIndex] = prev + (mov.quantidade || 0)
  }
}
```

**Solução:** Criar endpoint `/movimentacoes/agregadas` no backend com parâmetros de período.

---

## ✅ O que PODE ficar no Frontend

1. **Formatação de dados para exibição** (moeda, datas, números)
2. **Transformações simples de UI** (cores, ícones baseados em status)
3. **Validações de formulário** (campos obrigatórios, formato de email)
4. **Ordenação simples de arrays pequenos** (para listas locais)
5. **Filtros de UI** (busca em tempo real em listas já carregadas)

---

## 📋 Recomendações de Implementação no Backend

### Endpoints a Criar/Modificar:

1. **POST /estoques** - Calcular `valor_total` automaticamente
2. **GET /produtos** - Adicionar query params: `?filtro=nome&pagina=1&tamanho=20`
3. **GET /produtos/:id/estoque** - Retornar estoque total calculado
4. **GET /dashboards/stats** - Retornar todas as estatísticas
5. **GET /usuarios/stats** - Retornar estatísticas de usuários
6. **GET /produtos/estoque-baixo** - Listar produtos com estoque baixo
7. **GET /lotes/vencendo-proximo?dias=30** - Listar lotes próximos ao vencimento
8. **GET /dashboards/valor-por-categoria** - Valor em estoque por categoria
9. **GET /dashboards/produtos-por-categoria** - Contagem de produtos por categoria
10. **GET /movimentacoes/agregadas?periodo=7dias** - Movimentações agregadas

---

## 🎯 Prioridade de Implementação

**Alta Prioridade:**
1. Cálculo de `valor_total` em movimentações
2. Estatísticas de dashboard
3. Filtros e paginação de produtos

**Média Prioridade:**
4. Estoque total por produto
5. Produtos com estoque baixo
6. Produtos próximos ao vencimento

**Baixa Prioridade:**
7. Estatísticas de usuários (já que é simples)
8. Agregações de gráficos (pode ser otimizado depois)

