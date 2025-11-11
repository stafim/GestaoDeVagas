[x] 1. Install the required packages
[x] 2. Restart the workflow to see if the project is working
[x] 3. Verify the project is working using the feedback tool
[x] 4. Import completed - Application running successfully on port 5000
[x] 5. tsx package installed to fix workflow startup issue
[x] 6. Workflow configured with webview output on port 5000
[x] 7. Application verified running with all API endpoints responding
[x] 8. Final verification completed - Dashboard accessible and functional

## Nova Feature: Sistema de Permissões por Menu
[x] 1. Atualizar schema para incluir permissões de menu
[x] 2. Implementar métodos de storage para permissões de menu
[x] 3. Criar rotas da API
[x] 4. Atualizar UI da página de Permissões
[x] 5. Atualizar Sidebar para respeitar permissões
[x] 6. Corrigir problema de segurança (null vs array vazio)
[x] 7. Revisão final e testes

## Dados de Exemplo: 200 Profissões
[x] 1. Configurar banco de dados PostgreSQL
[x] 2. Executar migração do schema
[x] 3. Criar script de seed com 200 profissões
[x] 4. Executar script e popular banco de dados
[x] 5. Verificar funcionamento da aplicação

## Dados de Exemplo: 30 Vagas + Dados Relacionados
[x] 1. Criar 3 usuários recrutadores
[x] 2. Criar 5 empresas
[x] 3. Criar 15 centros de custo
[x] 4. Criar 10 clientes
[x] 5. Criar 5 escalas de trabalho
[x] 6. Criar 8 benefícios
[x] 7. Criar 30 vagas de exemplo
[x] 8. Verificar exibição no dashboard

## Kanban: Configuração de Stages
[x] 1. Criar 7 colunas do Kanban
[x] 2. Associar vagas ao kanban board
[x] 3. Verificar exibição do Kanban

## Novas Permissões
[x] 1. Adicionar permissão "approve_jobs" (Aprovar Vagas)
[x] 2. Adicionar permissão "assign_to_jobs" (Pegar Vagas no Grid)
[x] 3. Atualizar schema do banco de dados
[x] 4. Atualizar interface de permissões no frontend
[x] 5. Aplicar migração no banco

## Novos Campos no Formulário de Vagas
[x] 1. Adicionar campo "Centro de Custo" (já existia)
[x] 2. Adicionar campo "Descrição do Centro de Custo"
[x] 3. Adicionar campo "Posto de Trabalho"
[x] 4. Atualizar schema do banco de dados (jobs table)
[x] 5. Atualizar componente JobModal com os novos campos
[x] 6. Aplicar migração no banco
[x] 7. Campo condicional "Funcionário Substituído" (já implementado)
[x] 8. Mover campos "Centro de Custo" e "Descrição do Centro de Custo" para seção "Informações Básicas"

## Criação de 5 Empresas
[x] 1. Criar empresa "Opus Consultoria"
[x] 2. Criar empresa "Opus Logistica"
[x] 3. Criar empresa "Acelera IT"
[x] 4. Criar empresa "Opus Serviços"
[x] 5. Criar empresa "Telos Consultoria"
[x] 6. Verificar empresas criadas na interface

## Criação de 6 Clientes
[x] 1. Criar cliente "Localiza"
[x] 2. Criar cliente "Unidas"
[x] 3. Criar cliente "Stellantis"
[x] 4. Criar cliente "Volkswagen"
[x] 5. Criar cliente "Movida"
[x] 6. Criar cliente "Mercado Livre"
[x] 7. Verificar clientes criados na interface

## Configuração do Banco de Dados PostgreSQL
[x] 1. Identificar problema de armazenamento em memória
[x] 2. Criar banco de dados PostgreSQL
[x] 3. Executar migrações (npm run db:push)
[x] 4. Recriar empresas no banco de dados
[x] 5. Recriar clientes no banco de dados
[x] 6. Verificar persistência dos dados na interface

## Criação de Funcionários Fictícios para Clientes
[x] 1. Criar schema para aceitar datas como strings
[x] 2. Criar script para gerar funcionários fictícios
[x] 3. Criar 4 funcionários para Localiza
[x] 4. Criar 3 funcionários para Unidas
[x] 5. Criar 5 funcionários para Stellantis
[x] 6. Criar 4 funcionários para Volkswagen
[x] 7. Criar 3 funcionários para Movida
[x] 8. Criar 5 funcionários para Mercado Livre
[x] 9. Verificar total de 24 funcionários criados

## Correção de Erros na Página de Permissões
[x] 1. Corrigir loop infinito causado por useEffect
[x] 2. Substituir useEffect por useMemo para derivar permissões
[x] 3. Criar estado local para edições temporárias
[x] 4. Corrigir erro ao desmarcar permissão inexistente
[x] 5. Atualizar método toggleRolePermission no storage
[x] 6. Verificar que permissões podem ser alteradas sem erros

## Correção: Erro ao Gravar API Key Senior Integration
[x] 1. Identificar problema: usuário demo sem organizationId
[x] 2. Criar organização padrão no banco de dados
[x] 3. Criar usuário demo no banco de dados com organizationId
[x] 4. Atualizar DEMO_USER no código com organizationId
[x] 5. Reiniciar aplicação e testar gravação de API key

## Busca de Tabelas na API Senior
[x] 1. Criar rota GET /api/senior-integration/tables
[x] 2. Implementar chamada para endpoint /tables da API Senior
[x] 3. Testar endpoint e buscar tabelas disponíveis
[x] 4. Analisar e catalogar 4.046 tabelas encontradas
[x] 5. Salvar lista completa em arquivo para consulta

## Replit Environment Migration - November 11, 2025
[x] 1. Reinstall missing npm packages
[x] 2. Create PostgreSQL database
[x] 3. Run database migrations (npm run db:push)
[x] 4. Restart workflow successfully
[x] 5. Verify application running on port 5000
[x] 6. Confirm all API endpoints responding correctly
[x] 7. Complete project import verification

## Correção: Organization ID Not Found - Senior Integration
[x] 1. Identificar erro ao salvar API key da Senior HCM
[x] 2. Verificar organizationId no DEMO_USER
[x] 3. Buscar ID da organização "Grupo OPUS" no banco de dados
[x] 4. Atualizar DEMO_USER com organizationId correto (a6b0e84d-df56-45ab-810b-310f100cd760)
[x] 5. Reiniciar aplicação para aplicar mudanças
[x] 6. Confirmar que configuração da Senior HCM agora funciona

## Restrição de Acesso: Funções Master Admin
[x] 1. Identificar requisito: apenas Master Admin acessa Organizações, Planos e Financeiro
[x] 2. Verificar estrutura do schema: organizationId === null = Master Admin
[x] 3. Modificar Sidebar para adicionar verificação isMasterAdmin
[x] 4. Implementar filtro: apenas usuários com organizationId === null veem itens admin
[x] 5. Testar: usuário atual (com organizationId) não verá itens administrativos