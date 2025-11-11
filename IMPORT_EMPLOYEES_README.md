# Importação de Funcionários da Senior HCM

## 📋 Descrição

Este script importa funcionários da tabela `r033pes` do Senior HCM que estão alocados em centros de custo que contêm a palavra "localiza" no nome.

## 🎯 Pré-requisitos

1. **Cliente Localiza cadastrado**: Deve existir um cliente com "Localiza" no nome
2. **Centros de custo importados**: Centros de custo com "Localiza" devem estar no banco de dados
3. **Credenciais Senior configuradas**: Variáveis de ambiente SENIOR_API_URL e SENIOR_API_KEY devem estar configuradas

## 🔧 Como Executar

```bash
npm run import:employees
```

## 📊 O que o script faz

1. **Busca o cliente Localiza** no banco de dados local
2. **Identifica centros de custo** com a palavra "localiza"
3. **Consulta a tabela r033pes** do Senior HCM filtrando funcionários nesses centros de custo
4. **Faz o JOIN** com as tabelas:
   - `r024car` - Para obter informações do cargo
   - `r018ccu` - Para obter informações do centro de custo
5. **Importa/Atualiza** os funcionários na tabela `client_employees`

## 📦 Dados Importados

Para cada funcionário, o script importa:

- **Nome** (nomfun)
- **Cargo** (titcar)
- **Centro de Custo** (nomccu)
- **Status** (sitafa):
  - `A` → Ativo
  - `D` → Desligado
  - `F` → Férias
  - `L` ou `A` → Afastamento
- **Data de Admissão** (datadm)
- **Data de Demissão** (datdem)
- **Matrícula** (numcad) - armazenada nas observações

## 🔄 Lógica de Duplicatas

O script verifica se um funcionário já existe verificando:
- Mesmo cliente
- Mesmo nome

Se existir: **Atualiza** os dados
Se não existir: **Cria** um novo registro

## 📈 Relatório de Importação

Ao final, o script exibe:
- ✅ Número de novos funcionários importados
- 🔄 Número de funcionários atualizados
- ❌ Número de erros
- 📋 Total processado

## 🛠️ Estrutura da Query SQL

```sql
SELECT 
  p.numcad,        -- Matrícula
  p.nomfun,        -- Nome do funcionário
  p.sitafa,        -- Situação (A/D/F/L)
  p.datadm,        -- Data de admissão
  p.datdem,        -- Data de demissão
  c.codcar,        -- Código do cargo
  c.titcar,        -- Título do cargo
  cc.nomccu,       -- Nome do centro de custo
  cc.codccu        -- Código do centro de custo
FROM r033pes p
LEFT JOIN r024car c ON p.codcar = c.codcar
LEFT JOIN r018ccu cc ON p.codccu = cc.codccu
WHERE cc.codccu IN (códigos dos centros Localiza)
ORDER BY p.nomfun
```

## ⚠️ Observações

- O script só importa funcionários de centros de custo já cadastrados localmente
- Funcionários sem centro de custo correspondente serão ignorados
- A importação pode ser executada múltiplas vezes (atualiza dados existentes)

## 🔍 Visualização no Sistema

Após a importação, acesse:
1. **Página Clientes**
2. Clique no botão **Funcionários** (ícone 👥) do cliente Localiza
3. Veja a lista filtrada de funcionários importados
