# Tabelas de Profissões/Cargos no Senior HCM

## Resumo Executivo

Foram encontradas **55 tabelas** relacionadas a profissões, cargos e funções no banco de dados Senior HCM.

## 📋 Tabelas Principais Identificadas

### 1. **r030car** - Cargos (Tabela Principal)
- **Total de registros**: 20
- **Campos identificados**: 3 (numemp, datalt, estcar)
- **Status**: ⚠️ Estrutura parece incompleta - precisa investigação adicional
- **Uso recomendado**: Tabela padrão de cargos do Senior HCM

### 2. **r017car** - Cargos Detalhados
- **Status**: Não consultada ainda
- **Descrição**: Tabela auxiliar de cargos
- **Uso recomendado**: Pode conter detalhes adicionais dos cargos

### 3. **r024car** - Cargos
- **Status**: Não consultada ainda
- **Descrição**: Outra tabela de cargos
- **Uso recomendado**: Verificar se é a tabela principal de cargos com descrições

### 4. **r024cbo** - CBO (Classificação Brasileira de Ocupações)
- **Status**: ❌ Não acessível (erro ao consultar)
- **Descrição**: Códigos CBO oficiais do MTE
- **Uso recomendado**: Importar CBOs para classificação oficial de ocupações

### 5. **r034fun** - Funções/Colaboradores ⭐
- **Total de registros**: 26.594 (colaboradores ativos e inativos)
- **Campos identificados**: 193 campos
- **Campos principais**:
  - `numcad` - Número do cadastro (matrícula)
  - `nomfun` - Nome completo do colaborador
  - `codcar` - **Código do cargo** (ex: "0048")
  - `estcar` - Estado do cargo
  - `numemp` - Número da empresa
  - `sitafa` - Situação (ativo/demitido)
  - `datadm` - Data de admissão
  - `numcpf` - CPF
- **Uso recomendado**: Contém a vinculação de colaboradores aos seus cargos

### 6. **r030pro** - Profissões
- **Total de registros**: 1
- **Status**: ⚠️ Poucos registros - não é a tabela principal
- **Campos**: numemp, codpro, numpro, tippju, extins, clapro, basdes, obspro

### 7. **r038pro** - Profissões
- **Status**: Não consultada ainda
- **Descrição**: Possível tabela de profissões
- **Uso recomendado**: Investigar se contém cadastro de profissões

## 📊 Todas as 55 Tabelas Encontradas

```
r008pro, r017car, r017car_aux, r024car, r024car_aux, r024cbo,
r030car, r030pro, r034fun, r034fun_aud, r035pro, r038pro,
r042pro, r058pro, r062pro, r063fun, r072car, r075car, r077pro,
r080pro, r081pro, r082pro, r083car, r083fun, r083pro, r086ocu,
r087pro, r088pro, r089pro, r090pro, r092pro, r108pro, r121car,
r130ocu, r168pro, r195fun, r195pro, r197pro, r201pro, r206car,
r300pro, r304pro, r305pro, r349pro, r350car, r350fun, r350pro,
r400pro, r577pro, r584car, r873pro, usu_tetaproc, usu_tr024car,
usu_tr034fun, vql_quafun
```

## 🎯 Recomendações para Importação

### Opção 1: Importar da r034fun (Funções/Colaboradores)
**Prós:**
- ✅ 26.594 registros disponíveis
- ✅ Contém o campo `codcar` (código do cargo)
- ✅ Permite extrair lista única de cargos utilizados na prática
- ✅ Tabela já testada e acessível

**Contras:**
- ⚠️ Não contém descrição detalhada do cargo (apenas código)
- ⚠️ Precisa fazer join com outra tabela para obter nome do cargo

**Query sugerida:**
```sql
SELECT DISTINCT 
  estcar,
  codcar
FROM r034fun 
WHERE sitafa IN (1, 2, 7)  -- Ativos
ORDER BY codcar
```

### Opção 2: Importar da r024car ou r017car
**Prós:**
- ✅ Deve conter descrição completa dos cargos
- ✅ Tabela dedicada a cargos

**Contras:**
- ⚠️ Precisa testar acesso à tabela
- ⚠️ Estrutura desconhecida

**Ação necessária:**
Executar query de teste para verificar campos disponíveis:
```sql
SELECT TOP 5 * FROM r024car
SELECT TOP 5 * FROM r017car
```

### Opção 3: Importar da r024cbo (CBO Oficial)
**Prós:**
- ✅ Códigos oficiais do Ministério do Trabalho
- ✅ Padronização nacional
- ✅ Classificação completa de ocupações

**Contras:**
- ❌ Tabela não acessível no momento
- ⚠️ Pode ter milhares de ocupações que não são utilizadas

## 🔍 Próximos Passos Sugeridos

1. **Investigar r024car e r017car**
   - Executar query para verificar estrutura completa
   - Verificar se contém nome/descrição dos cargos

2. **Mapear relação entre tabelas**
   - Entender como `estcar` + `codcar` de r034fun se relacionam com outras tabelas
   - Verificar se existe chave composta empresa+cargo

3. **Decidir estratégia de importação**
   - Opção A: Importar apenas cargos em uso (da r034fun)
   - Opção B: Importar cadastro completo de cargos (da r024car/r017car)
   - Opção C: Aguardar acesso à r024cbo para importar CBOs oficiais

4. **Implementar importação**
   - Criar script similar ao de centros de custo
   - Mapear campos Senior → VagasPro
   - Adicionar campo `seniorId` na tabela professions

## 📌 Campos Importantes Identificados

| Campo Senior | Descrição | Exemplo |
|--------------|-----------|---------|
| `estcar` | Estado/Estabelecimento do cargo | 10 |
| `codcar` | Código do cargo | "0048" |
| `numemp` | Número da empresa | 1 |
| `nomfun` | Nome do colaborador | "ELIANE SILVA MENDES" |
| `codccu` | Código do centro de custo | 157 |
| `sitafa` | Situação (1=Ativo, 7=Demitido) | 1, 7 |

---

**Documento gerado em**: 11/11/2025  
**Sistema**: VagasPro - Integração Senior HCM  
**Versão da análise**: 1.0
