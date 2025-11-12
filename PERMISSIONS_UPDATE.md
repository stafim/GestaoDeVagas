# Atualização do Sistema de Permissões

**Data**: 12/11/2025  
**Tipo**: Correção de Bug + Migração de Schema

## 🐛 Problema Identificado

O sistema estava apresentando erro ao criar permissões para tipos de usuário:

```
Error: invalid input value for enum permission_type: "access_dashboard"
```

### Causa Raiz

- A página de **Permissões** foi redesenhada para usar um sistema baseado em **menu items**
- Novos valores de permissão: `access_dashboard`, `access_jobs`, `access_kanban`, etc.
- O enum `permission_type` no banco de dados ainda tinha apenas os valores antigos
- Valores antigos: `create_jobs`, `edit_jobs`, `view_jobs`, etc.

## ✅ Solução Implementada

### 1. Atualização do Banco de Dados

Adicionados 11 novos valores ao enum `permission_type`:

```sql
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_dashboard';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_jobs';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_kanban';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_approvals';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_companies';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_clients';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_users';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_permissions';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_workflow';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_settings';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'access_reports';
```

### 2. Atualização do Schema TypeScript

Arquivo: `shared/schema.ts`

```typescript
export const permissionTypeEnum = pgEnum("permission_type", [
  // Permissões antigas (operações granulares) - 19 valores
  "create_jobs",
  "edit_jobs", 
  "delete_jobs",
  "view_jobs",
  "approve_jobs",
  "assign_to_jobs",
  "create_companies",
  "edit_companies",
  "delete_companies",
  "view_companies",
  "manage_cost_centers",
  "view_applications",
  "manage_applications",
  "interview_candidates",
  "hire_candidates",
  "view_reports",
  "export_data",
  "manage_users",
  "manage_permissions",
  // Novas permissões baseadas em menu (access control) - 11 valores
  "access_dashboard",
  "access_jobs",
  "access_kanban",
  "access_approvals",
  "access_companies",
  "access_clients",
  "access_users",
  "access_permissions",
  "access_workflow",
  "access_settings",
  "access_reports"
]);
```

## 📊 Resultado

- ✅ **Total de 30 valores** no enum `permission_type`
- ✅ **19 valores antigos** mantidos para compatibilidade retroativa
- ✅ **11 novos valores** para sistema baseado em menu
- ✅ Schema TypeScript sincronizado com banco de dados
- ✅ Sistema de permissões funcionando corretamente

## 🎯 Impacto

### Compatibilidade
- ✅ Valores antigos preservados - nenhum código legado quebrado
- ✅ Novos valores permitem controle granular por menu
- ✅ Possibilidade de migração gradual de permissões

### Arquitetura
O sistema agora suporta **dois modelos de permissões**:

1. **Permissões Granulares** (antigo):
   - `create_jobs`, `edit_jobs`, `delete_jobs`, etc.
   - Controle fino sobre operações específicas

2. **Permissões por Menu** (novo):
   - `access_dashboard`, `access_jobs`, `access_kanban`, etc.
   - Controle simplificado de acesso a módulos inteiros

## 📦 Dump do Banco de Dados

**Arquivo**: `database_dump_final_20251112_145413.sql` (775 KB)

Inclui:
- ✅ Enum atualizado com 30 valores
- ✅ Todas as estruturas de tabelas
- ✅ Dados completos do sistema
- ✅ Pronto para deploy em VM

## 🚀 Próximos Passos

Para usar o sistema de permissões atualizado:

1. **Em desenvolvimento**: O schema já está atualizado e funcionando
2. **Em produção/VM**: Restaurar o dump mais recente que já inclui as alterações
3. **Migração de permissões**: Considerar migrar permissões antigas para o novo formato baseado em menu

## 🔍 Verificação

Para verificar se o enum está correto:

```bash
psql $DATABASE_URL -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'permission_type') ORDER BY enumsortorder;"
```

Deve retornar 30 valores.
