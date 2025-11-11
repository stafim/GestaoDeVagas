# 📋 Como Importar Funcionários da Localiza

## ✅ O que foi implementado

Foi criado um **script de importação automática** que busca funcionários da tabela `r033pes` do Senior HCM e os importa para o sistema VagasPro.

### Características:

- ✅ **Filtro automático por centro de custo**: Importa apenas funcionários em CCs com "localiza"
- ✅ **Mapeamento de cargos**: Faz JOIN com tabela r024car para obter informações do cargo
- ✅ **Mapeamento de centro de custo**: Faz JOIN com tabela r018ccu
- ✅ **Status inteligente**: Converte códigos do Senior para status do sistema
- ✅ **Prevenção de duplicatas**: Verifica se funcionário já existe antes de inserir
- ✅ **Atualização automática**: Se existir, atualiza os dados

---

## 📦 Pré-requisitos

Antes de executar a importação, certifique-se de que:

1. ✅ **Cliente Localiza cadastrado**
   - Deve existir um cliente com "Localiza" no nome
   - Pode ser importado pela sincronização de clientes ou criado manualmente

2. ✅ **Centros de custo importados** 
   - Deve haver centros de custo com "Localiza" no nome
   - Total esperado: ~20 centros de custo Localiza

3. ✅ **Credenciais Senior configuradas**
   - `SENIOR_API_URL` - URL da API Senior
   - `SENIOR_API_KEY` - Chave de acesso à API

---

## 🔧 Como Executar

### Passo 1: Configurar Credenciais (se ainda não configuradas)

As credenciais do Senior HCM precisam estar configuradas como variáveis de ambiente:

```env
SENIOR_API_URL=https://sua-api-senior.com
SENIOR_API_KEY=sua-chave-de-api
```

### Passo 2: Executar o Script

No terminal, execute:

```bash
npm run import:employees
```

### Passo 3: Acompanhar o Progresso

O script exibirá:
- ✅ Cliente encontrado
- 📊 Número de centros de custo Localiza
- 📥 Número de funcionários na Senior
- ✅/🔄 Cada funcionário importado/atualizado
- 📊 Resumo final da importação

---

## 📊 Exemplo de Saída

```
🚀 Iniciando importação de funcionários da Senior...

✅ Cliente encontrado: Localiza (ID: bc330998-...)

📊 20 centros de custo Localiza encontrados

📡 Buscando funcionários da tabela r033pes...
📥 150 funcionários encontrados na Senior

✅ Importado: Ana Paula Silva (LOCALIZA - SP)
✅ Importado: Carlos Eduardo Santos (LOCALIZA - MG)
🔄 Atualizado: João Pedro Costa (LOCALIZA - RJ)
...

═══════════════════════════════════════
📊 RESUMO DA IMPORTAÇÃO
═══════════════════════════════════════
✅ Novos funcionários importados: 145
🔄 Funcionários atualizados: 5
❌ Erros: 0
📋 Total processado: 150
═══════════════════════════════════════

✨ Importação concluída com sucesso!
```

---

## 🔍 Visualizar Funcionários Importados

Após a importação:

1. Acesse a página **Clientes**
2. Localize o cliente **Localiza**
3. Clique no botão **Funcionários** (ícone 👥)
4. Você verá apenas os funcionários em centros de custo com "Localiza"

---

## 📋 Dados Importados

Para cada funcionário, são importados:

| Campo | Origem Senior | Descrição |
|-------|---------------|-----------|
| **Nome** | `nomfun` | Nome completo do funcionário |
| **Cargo** | `titcar` | Título do cargo (via JOIN com r024car) |
| **Centro de Custo** | `nomccu` | Nome do CC (via JOIN com r018ccu) |
| **Status** | `sitafa` | Situação (A/D/F/L convertido para ativo/desligado/férias/afastamento) |
| **Data Admissão** | `datadm` | Data de admissão |
| **Data Demissão** | `datdem` | Data de desligamento (se aplicável) |
| **Observações** | `numcad` | Matrícula armazenada nas observações |

---

## 🔄 Mapeamento de Status

O script converte automaticamente os códigos de situação do Senior:

| Código Senior | Status no Sistema |
|---------------|-------------------|
| `A` | Ativo |
| `D` | Desligado |
| `F` | Férias |
| `L` ou `A` | Afastamento |

---

## ⚠️ Troubleshooting

### Erro: "Cliente Localiza não encontrado"

**Solução**: Crie ou importe o cliente Localiza primeiro
```bash
# Na interface: Clientes > Importar da Senior
# Ou crie manualmente com nome "Localiza"
```

### Erro: "Nenhum centro de custo Localiza encontrado"

**Solução**: Os centros de custo devem estar importados no banco de dados
```sql
-- Verificar se existem CCs Localiza:
SELECT COUNT(*) FROM cost_centers WHERE name ILIKE '%localiza%';
```

### Erro: "SENIOR_API_URL ou SENIOR_API_KEY não estão configurados"

**Solução**: Configure as variáveis de ambiente no Replit Secrets

---

## 🛠️ Detalhes Técnicos

### Query SQL Executada

```sql
SELECT 
  p.numcad,        -- Matrícula
  p.nomfun,        -- Nome do funcionário
  p.sitafa,        -- Situação
  p.datadm,        -- Data de admissão
  p.datdem,        -- Data de demissão
  c.codcar,        -- Código do cargo
  c.titcar,        -- Título do cargo
  cc.nomccu,       -- Nome do centro de custo
  cc.codccu        -- Código do centro de custo
FROM r033pes p
LEFT JOIN r024car c ON p.codcar = c.codcar
LEFT JOIN r018ccu cc ON p.codccu = cc.codccu
WHERE cc.codccu IN ('850003', '5', '850024', ...)
ORDER BY p.nomfun
```

### Lógica de Duplicatas

1. Busca funcionário existente por: `clientId + name`
2. Se encontrado: **UPDATE** dos dados
3. Se não encontrado: **INSERT** novo registro

---

## 📈 Próximos Passos

Após a importação, você pode:

1. ✅ **Ver funcionários no modal**
   - Clique em "Funcionários" na página de Clientes

2. ✅ **Filtrar por busca**
   - Use o campo de busca para filtrar por nome, cargo ou status

3. ✅ **Reimportar periodicamente**
   - Execute `npm run import:employees` sempre que precisar atualizar

---

## 💡 Dicas

- A importação pode ser executada **múltiplas vezes** sem problemas
- Funcionários existentes serão **atualizados** com novos dados
- Apenas funcionários em CCs com "Localiza" são importados
- O processo é **rápido** e **automático**
