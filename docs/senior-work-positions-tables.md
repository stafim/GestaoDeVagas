# Tabelas de Postos de Trabalho no Senior HCM

## Resumo Executivo

Foram encontradas **7 tabelas** relacionadas a postos de trabalho (POS) no banco de dados Senior HCM, além de **5 tabelas de localização** (LOC) e **13 tabelas de cargos** (CAR).

---

## 📋 Tabelas Principais de Postos (POS)

### 1. **r017pos** - Postos de Trabalho ⭐ (PRINCIPAL)
- **Total de registros**: 3.057 postos cadastrados
- **Campos identificados**: 10 campos
- **Campos principais**:
  - `estpos` - Estabelecimento do posto
  - `postra` - **Código do posto** (ex: "06.001.620049.0305")
  - `desred` - **Descrição reduzida** (nome curto)
  - `despos` - **Descrição completa** (nome completo)
  - `datcri` - Data de criação
  - `datext` - Data de extinção
  - `perpos` - Período do posto
  - `obspos` - Observações
  - `codusu` - Código do usuário
  - `dthalt` - Data/hora de alteração

**Exemplo real:**
```
Código: 06.001.620049.0305
Descrição: ANALISTA DE RH PSCA _ CLT
Data criação: 03/08/2023
```

**✅ Esta é a melhor tabela para importar postos de trabalho!**

---

### 2. **r017car** - Posições de Cargos na Estrutura
- **Total de registros**: 3.211 posições
- **Campos identificados**: 34 campos
- **Campos principais**:
  - `estpos` - Estabelecimento da posição
  - `postra` - **Código do posto** (relaciona com r017pos)
  - `estcar` + `codcar` - **Código do cargo** (relaciona com r024car)
  - `numemp` - Número da empresa
  - `codfil` - Código da filial
  - `taborg` - Tipo de organização
  - `numloc` - **Número do local**
  - `codccu` - **Centro de custo** (relaciona com r018ccu)
  - `datini` / `datfim` - Período de vigência
  - `codvin` - Código de vínculo
  - `tipvag` - Tipo de vaga
  - `tipcon` - Tipo de contrato

**Exemplos reais:**
```
1. Posto: 06.001.620049.0305
   Cargo: 1-4 | Empresa: 6 | Filial: 1
   Local: 71 | Período: 03/08/2023 - 04/06/2080

2. Posto: 01
   Cargo: 10-0022 | Empresa: 1 | Filial: 1
   Local: 1 | Centro Custo: 100 | Período: 01/07/2021 - 04/06/2080
```

**✅ Esta tabela vincula postos → cargos → centros de custo → locais**

---

### 3. **r030pos** - Configuração de Postos
- **Total de registros**: 20 (um por empresa)
- **Campos**: numemp, datalt, estpos, posdef
- **Uso**: Configuração padrão de postos por empresa

---

### 4. **r110pos** - Postos (Estabelecimentos de Saúde)
- **Total de registros**: 20
- **Campos**: codpos, despos, endpos, codcid, etc.
- **Uso**: Específico para estabelecimentos de saúde (hospitais)
- **Exemplo**: "HOSPITAL SÃO BERNARDO DO CAMPO"

---

### 5. **r058pos**, **r085pos**, **r108pos** - Tabelas Vazias
- Estas tabelas existem mas estão vazias no momento

---

## 🗺️ Tabelas de Localização (LOC)

### **r034loc** - Locais de Trabalho
- Tabela que armazena os locais físicos onde os postos estão alocados
- Relaciona com `numloc` da tabela r017car

Outras tabelas: r064loc, r094loc, r122loc, r128loc

---

## 🔗 Relacionamento Entre Tabelas

```
┌─────────────────────────────────────────────────────────────┐
│                  ESTRUTURA DE DADOS                          │
└─────────────────────────────────────────────────────────────┘

r017pos (Postos)                    r024car (Cargos)
   ├─ postra                            ├─ codcar
   ├─ despos                            ├─ titcar
   └─ estpos                            └─ codcbo
        │                                    │
        │                                    │
        └────────────────┬───────────────────┘
                         │
                         ▼
              r017car (Posições na Estrutura)
                    ├─ postra (→ r017pos)
                    ├─ codcar (→ r024car)
                    ├─ numemp (→ r030emp)
                    ├─ codccu (→ r018ccu)
                    └─ numloc (→ r034loc)
                         │
                         ▼
              r034fun (Colaboradores)
                    ├─ codcar (cargo atual)
                    ├─ numloc (local)
                    └─ codccu (centro custo)
```

---

## 📊 Dados Disponíveis

| Tabela | Registros | Status | Prioridade |
|--------|-----------|--------|------------|
| r017pos | 3.057 | ✅ Ativo | 🔴 Alta |
| r017car | 3.211 | ✅ Ativo | 🔴 Alta |
| r024car | 1.200 | ✅ **Já importado** | ✅ Concluído |
| r018ccu | 2.593 | ✅ **Já importado** | ✅ Concluído |
| r034loc | ? | ⚠️ Não analisada | 🟡 Média |
| r110pos | 20 | ✅ Ativo | 🟢 Baixa |
| r030pos | 20 | ✅ Ativo | 🟢 Baixa |

---

## 🎯 Recomendações de Importação

### Opção 1: Importar Postos (r017pos) ⭐ RECOMENDADO
**Prós:**
- ✅ 3.057 postos cadastrados
- ✅ Descrições curtas e completas
- ✅ Estrutura simples e direta
- ✅ Pode ser vinculado com r017car posteriormente

**Query sugerida:**
```sql
SELECT 
  estpos,
  postra,
  despos AS nome_completo,
  desred AS nome_curto,
  datcri,
  perpos
FROM r017pos 
WHERE datext = '1900-12-31'  -- Apenas postos ativos
ORDER BY estpos, postra
```

---

### Opção 2: Importar Estrutura Completa (r017car + r017pos)
**Prós:**
- ✅ Vincula posto → cargo → centro de custo → local
- ✅ Estrutura organizacional completa
- ✅ Permite rastreamento de mudanças ao longo do tempo

**Contras:**
- ⚠️ Mais complexo (34 campos)
- ⚠️ Requer importação de r034loc também

**Query sugerida:**
```sql
SELECT 
  r017car.postra,
  r017pos.despos,
  r017car.estcar,
  r017car.codcar,
  r017car.numemp,
  r017car.codfil,
  r017car.codccu,
  r017car.numloc,
  r017car.datini,
  r017car.datfim
FROM r017car
LEFT JOIN r017pos ON r017car.postra = r017pos.postra 
  AND r017car.estpos = r017pos.estpos
WHERE r017car.datfim > GETDATE()  -- Apenas posições vigentes
ORDER BY r017car.estpos, r017car.postra
```

---

## 💡 Próximos Passos Sugeridos

1. **Analisar r034loc** - Ver estrutura de locais de trabalho
2. **Importar r017pos** - Popular tabela de postos no VagasPro
3. **Criar relacionamento** - Vincular postos com cargos já importados
4. **Estender frontend** - Adicionar campo de "Posto de Trabalho" no formulário de vagas

---

## 📝 Campos Importantes Identificados

### r017pos (Postos)
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `estpos` | Estabelecimento | 1 |
| `postra` | Código do posto | "06.001.620049.0305" |
| `desred` | Nome curto | "ANALISTA DE RH PSCA _ CLT" |
| `despos` | Nome completo | "ANALISTA DE RH PSCA _ CLT" |
| `datcri` | Data de criação | "2023-08-03" |

### r017car (Posições)
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `postra` | Código do posto | "01" |
| `estcar` + `codcar` | Código do cargo | "10-0022" |
| `numemp` | Empresa | 1 |
| `codccu` | Centro de custo | "100" |
| `numloc` | Local | 1 |

---

**Documento gerado em**: 11/11/2025  
**Sistema**: VagasPro - Integração Senior HCM  
**Versão da análise**: 1.0
