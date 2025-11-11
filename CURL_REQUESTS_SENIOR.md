# Curl Requests para API Senior - Diagnóstico

## Configuração Atual

**URL Base**: `https://senior-sql.acelera-it.io`  
**API Key**: `OpusApiKey_2025!`

---

## 1. Health Check (✅ Funciona)

```bash
curl -X GET https://senior-sql.acelera-it.io/health \
  -H "Authorization: Bearer OpusApiKey_2025!"
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T02:00:00.000Z"
}
```

---

## 2. Listar Tabelas (✅ Funciona)

```bash
curl -X GET https://senior-sql.acelera-it.io/tables \
  -H "Authorization: Bearer OpusApiKey_2025!"
```

**Resposta esperada**:
```json
["E085CLI", "E070EMP", "E001USU", ...]
```

---

## 3. Executar Query SQL - CLIENTES (❌ Falha)

### Request Principal (usado no código)

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{
    "sql": "SELECT CODCLI, NOMCLI, ENDCLI, CEPCLI, CGCCPF FROM E085CLI ORDER BY NOMCLI"
  }'
```

**Erro retornado**:
```json
{
  "error": "Somente SELECT é permitido"
}
```

---

## 4. Variações Testadas (todas falharam)

### A. Query mais simples possível

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT * FROM E085CLI"}'
```

### B. Query com WHERE

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT CODCLI, NOMCLI FROM E085CLI WHERE CODEMP = 1"}'
```

### C. Query com COUNT

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT COUNT(*) FROM E085CLI"}'
```

### D. Query com LIMIT

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT * FROM E085CLI LIMIT 1"}'
```

### E. Query com TOP (sintaxe SQL Server)

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT TOP 1 * FROM E085CLI"}'
```

**Todas retornam**: `{"error": "Somente SELECT é permitido"}`

---

## 5. Outras Queries que podem ser úteis

### Buscar Colaboradores (testado - funciona parcialmente)

```bash
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT NUMCAD, NOMFUN, SITAFA FROM E070EMP WHERE SITAFA = '\''A'\''"}'
```

---

## Análise do Problema

### Sintomas
1. ✅ API está online (health check funciona)
2. ✅ Autenticação está correta (retorna erro específico, não 401)
3. ✅ Endpoint /tables funciona
4. ❌ **TODAS** as queries SELECT retornam `"Somente SELECT é permitido"`

### Possíveis Causas

1. **Parser SQL da API pode estar com bug**
   - Está detectando SELECT como comando não-permitido
   - Pode ser problema de case-sensitive (SELECT vs select)
   - Pode ser problema com espaços ou formatação

2. **Formato do payload pode estar incorreto**
   - Campo pode não ser "sql"
   - Pode precisar de campo adicional (database, schema, etc)
   - Encoding pode estar incorreto

3. **Permissões da API Key**
   - API Key pode não ter permissão para executar queries
   - Pode precisar de outra autenticação além do Bearer token

4. **Limitações não documentadas**
   - API pode ter whitelist de queries permitidas
   - Pode precisar de parâmetros adicionais

---

## Possíveis Soluções para Testar

### 1. Testar diferentes formatos de payload

```bash
# Formato alternativo 1
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{
    "query": "SELECT * FROM E085CLI",
    "database": "SENIOR"
  }'

# Formato alternativo 2
curl -X POST https://senior-sql.acelera-it.io/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{
    "command": "SELECT * FROM E085CLI",
    "type": "query"
  }'
```

### 2. Verificar documentação oficial

Consultar com o suporte da Senior:
- Qual o formato correto do payload?
- Existe algum parâmetro adicional necessário?
- A API Key tem as permissões corretas?
- Existe alguma limitação de queries?

### 3. Verificar se existe endpoint alternativo

```bash
# Possível endpoint alternativo
curl -X POST https://senior-sql.acelera-it.io/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OpusApiKey_2025!" \
  -d '{"sql": "SELECT * FROM E085CLI"}'
```

---

## Próximos Passos Recomendados

1. **Contatar suporte Senior** com este documento
2. Perguntar:
   - ✅ Qual o formato correto do request?
   - ✅ Por que queries SELECT válidas retornam erro "Somente SELECT é permitido"?
   - ✅ Existe documentação da API SQL disponível?
   - ✅ A API Key precisa de permissões especiais?

3. **Alternativa**: Verificar se existe API REST nativa da Senior para buscar clientes
   - Pode ter endpoint tipo `/api/clients` ao invés de SQL direto
