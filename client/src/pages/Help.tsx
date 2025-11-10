import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BarChart3, 
  Building2, 
  UserCheck, 
  Briefcase, 
  Users, 
  Shield, 
  Settings2, 
  BookOpen,
  LayoutGrid,
  Bell,
  Plug
} from "lucide-react";

export default function Help() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Central de Ajuda</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manual completo de funcionamento do sistema VagasPro
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Dashboard */}
        <AccordionItem value="dashboard" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">Dashboard - Visão Geral</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              O Dashboard apresenta uma visão geral do sistema de gestão de vagas com métricas e indicadores importantes.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Principais Funcionalidades:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Métricas Principais:</strong> Visualize total de vagas, vagas ativas, candidaturas e empresas cadastradas</li>
                <li><strong>Vagas em Aberto:</strong> Acompanhe vagas sem data de admissão no mês atual</li>
                <li><strong>Gráficos:</strong> Análise visual da distribuição de vagas por status e tendências de candidaturas</li>
                <li><strong>Filtros:</strong> Filtre dados por mês, empresa, divisão e recrutador</li>
                <li><strong>Multi-seleção:</strong> Selecione múltiplos filtros simultaneamente para análises personalizadas</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Dica:</strong> Use os filtros no topo da página para focar em dados específicos e obter insights mais precisos.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Empresas */}
        <AccordionItem value="companies" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-semibold">Empresas - Cadastro e Gerenciamento</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Gerencie as empresas que publicam vagas no sistema, incluindo dados cadastrais e centros de custo.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Cadastrar uma Empresa:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Clique no botão <strong>"Nova Empresa"</strong> no canto superior direito</li>
                <li>Preencha os dados obrigatórios:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Nome da empresa</li>
                    <li>CNPJ (formato: 00.000.000/0000-00)</li>
                  </ul>
                </li>
                <li>Adicione informações complementares (endereço, telefone, email, website)</li>
                <li>Cadastre centros de custo (divisões/filiais) clicando em "Adicionar Centro de Custo"</li>
                <li>Escolha uma cor para identificação visual nos gráficos</li>
                <li>Clique em <strong>"Criar Empresa"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Gerenciamento de Centros de Custo:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Centros de custo representam divisões, filiais ou departamentos da empresa</li>
                <li>São utilizados para organizar vagas por áreas específicas</li>
                <li>Cada centro de custo possui nome e código únicos</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>Importante:</strong> Não é possível excluir empresas que possuem vagas cadastradas. Exclua as vagas primeiro.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Clientes */}
        <AccordionItem value="clients" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Clientes - Cadastro e Gerenciamento</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Cadastre e gerencie clientes que solicitam vagas, incluindo contratos e colaboradores.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Cadastrar um Cliente:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Clique no botão <strong>"Novo Cliente"</strong></li>
                <li>Preencha os dados principais:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Nome do cliente</li>
                    <li>Pessoa de contato</li>
                    <li>Telefone e email</li>
                    <li>Endereço completo</li>
                    <li>Limite máximo de vagas (opcional)</li>
                  </ul>
                </li>
                <li>Clique em <strong>"Criar Cliente"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Gerenciamento de Contratos:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Após criar o cliente, edite-o para fazer upload do contrato (PDF)</li>
                <li>O contrato fica disponível para download e visualização</li>
                <li>É possível substituir ou excluir contratos existentes</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Cadastro de Colaboradores do Cliente:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Na edição do cliente, acesse a aba "Colaboradores"</li>
                <li>Cadastre colaboradores com nome, cargo, telefone e email</li>
                <li>Busque colaboradores existentes na lista</li>
                <li>Edite ou exclua colaboradores conforme necessário</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>Dica:</strong> Use o campo "Limite de Vagas" para controlar quantas vagas simultâneas o cliente pode ter abertas.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Vagas */}
        <AccordionItem value="jobs" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-semibold">Vagas - Criação e Gerenciamento</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Crie e gerencie vagas de emprego com todos os detalhes necessários para o processo seletivo.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Criar uma Vaga:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Clique no botão <strong>"Nova Vaga"</strong></li>
                <li>Preencha as informações básicas:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Título da vaga</li>
                    <li>Empresa e centro de custo</li>
                    <li>Cliente solicitante</li>
                    <li>Categoria (operacional, administrativo, técnico, gerencial)</li>
                    <li>Localização</li>
                  </ul>
                </li>
                <li>Defina detalhes da posição:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Posição de trabalho (posto 1 a 10 - integração com HCM Senior)</li>
                    <li>Escala de trabalho (cadastrada em Configurações)</li>
                    <li>Faixa salarial (mínimo e máximo)</li>
                    <li>Benefícios oferecidos</li>
                  </ul>
                </li>
                <li>Adicione descrição completa e requisitos da vaga</li>
                <li>Atribua um recrutador responsável</li>
                <li>Selecione o quadro Kanban a ser utilizado</li>
                <li>Clique em <strong>"Criar Vaga"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Funcionalidades Disponíveis:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Busca e Filtros:</strong> Filtre por status, empresa ou recrutador</li>
                <li><strong>Detalhes da Vaga:</strong> Visualize informações completas em abas (Timeline, Informações, Admissão, Histórico)</li>
                <li><strong>Atribuir Recrutador:</strong> Atribua ou reatribua vagas a recrutadores</li>
                <li><strong>Pipeline Kanban:</strong> Acesse diretamente o Kanban da vaga</li>
                <li><strong>Exportação:</strong> Exporte a lista de vagas para CSV</li>
                <li><strong>Histórico de Status:</strong> Rastreie todas as mudanças de status com data, usuário e observações</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Aba de Admissão:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Registre dados de admissão: candidato aprovado, salário final, data de admissão</li>
                <li>Gere dossiê de admissão em PDF com todas as informações da vaga e candidato</li>
                <li>Visualize histórico completo de mudanças de status</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                <strong>Atenção:</strong> Vagas "em aberto" são aquelas sem data de admissão registrada. Complete a admissão para fechar a vaga.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Kanban */}
        <AccordionItem value="kanban" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-semibold">Kanban - Pipeline de Candidatos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Gerencie o fluxo de candidatos através de um quadro visual Kanban personalizado.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Utilizar o Kanban:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Selecione uma vaga no filtro superior</li>
                <li>O Kanban carrega automaticamente as etapas configuradas para aquela vaga</li>
                <li>Visualize candidatos em cada etapa do processo seletivo</li>
                <li>Arraste e solte cards de candidatos entre as colunas</li>
                <li>Adicione novos candidatos clicando em "Adicionar Candidato"</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Gerenciamento de Candidatos:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Novo Candidato:</strong> Cadastre dados completos (nome, CPF, telefone, email, endereço)</li>
                <li><strong>Candidato Existente:</strong> Busque na base e adicione à vaga</li>
                <li><strong>Notas:</strong> Adicione observações sobre cada candidato no processo</li>
                <li><strong>Visualizar Notas:</strong> Acesse o histórico de todas as anotações</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Etapas Personalizadas:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Cada vaga pode usar um quadro Kanban diferente</li>
                <li>Configure etapas personalizadas em Configurações → Kanban</li>
                <li>Crie múltiplas etapas de uma só vez ao criar um novo quadro</li>
                <li>Escolha cores para cada etapa (8 opções disponíveis)</li>
                <li>Defina um quadro como padrão para novas vagas</li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg">
              <p className="text-sm text-indigo-900 dark:text-indigo-100">
                <strong>Funcionalidade:</strong> Cada vaga pode ter seu próprio fluxo de etapas. Configure o Kanban ideal para cada tipo de processo seletivo.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Usuários */}
        <AccordionItem value="users" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-600" />
              <span className="text-lg font-semibold">Usuários - Gerenciamento</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Gerencie usuários do sistema e suas funções de acesso.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Criar um Usuário:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Clique no botão <strong>"Novo Usuário"</strong></li>
                <li>Preencha:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Nome completo</li>
                    <li>Email (será usado para login)</li>
                    <li>Senha inicial</li>
                  </ul>
                </li>
                <li>Selecione a função do usuário:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li><strong>Admin:</strong> Acesso total ao sistema</li>
                    <li><strong>Recruiter:</strong> Gerenciamento de vagas e candidatos</li>
                    <li><strong>Manager:</strong> Visualização e aprovações</li>
                    <li><strong>Approver:</strong> Aprovação de processos</li>
                    <li><strong>Analyst:</strong> Análise de dados</li>
                    <li><strong>Viewer:</strong> Visualização apenas</li>
                    <li><strong>User:</strong> Usuário padrão</li>
                  </ul>
                </li>
                <li>Clique em <strong>"Criar Usuário"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Gerenciamento:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Filtre usuários por função</li>
                <li>Edite informações de usuários existentes</li>
                <li>Redefina senhas quando necessário</li>
                <li>Exclua usuários inativos</li>
              </ul>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-950/30 p-4 rounded-lg">
              <p className="text-sm text-cyan-900 dark:text-cyan-100">
                <strong>Importante:</strong> A função do usuário define suas permissões base. Configure permissões detalhadas na página de Permissões.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Permissões */}
        <AccordionItem value="permissions" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold">Permissões - Controle de Acesso</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Sistema robusto de controle de acesso com permissões granulares por função e usuário.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Níveis de Permissão:</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">1. Permissões de Função (Role-Based)</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>17 permissões granulares (criar/editar/excluir vagas, candidatos, empresas, etc.)</li>
                    <li>Configure permissões por função de forma visual</li>
                    <li>Alterações aplicam-se a todos os usuários daquela função</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">2. Permissões de Menu por Usuário</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Controle quais páginas cada usuário pode acessar</li>
                    <li>Configuração individual por usuário</li>
                    <li>10 seções de menu configuráveis</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">3. Permissões por Status de Vaga</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Configure permissões de visualizar/editar para cada status</li>
                    <li>Controle granular por função e status</li>
                    <li>Permissões automáticas ao criar novos status</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">4. Atribuição de Empresa</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Vincule usuários a empresas específicas</li>
                    <li>Atribua funções diferentes por empresa</li>
                    <li>Controle de acesso multi-empresa</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Como Configurar Permissões:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Acesse a página de <strong>Permissões</strong></li>
                <li>Escolha o tipo de permissão a configurar (Função, Menu, Status ou Empresa)</li>
                <li>Selecione a função ou usuário</li>
                <li>Ative/desative permissões usando os switches</li>
                <li>As alterações são salvas automaticamente</li>
              </ol>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Atenção:</strong> Permissões incorretas podem bloquear usuários de acessar funcionalidades essenciais. Configure com cuidado.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Configurações */}
        <AccordionItem value="settings" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold">Configurações do Sistema</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Personalize o sistema com configurações de status, escalas de trabalho, quadros Kanban e notificações.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Status de Vagas</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Crie status personalizados para o ciclo de vida das vagas</li>
                  <li>Defina cores para identificação visual</li>
                  <li>Configure se o status está ativo</li>
                  <li>Permissões são criadas automaticamente para novos status</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Escalas de Trabalho</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Cadastre escalas de trabalho (12x36, 5x2, 6x1, etc.)</li>
                  <li>Adicione descrição detalhada de cada escala</li>
                  <li>Ative/desative escalas conforme necessidade</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Quadros Kanban</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Crie quadros Kanban personalizados</li>
                  <li>Adicione múltiplas etapas ao criar o quadro</li>
                  <li>Defina um quadro como padrão</li>
                  <li>Escolha cores para cada etapa</li>
                  <li>Gerencie etapas existentes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  Notificações
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Configure notificações por Email e WhatsApp</li>
                  <li>Ative/desative canais independentemente para cada status</li>
                  <li>Notificações são enviadas ao recrutador e criador da vaga</li>
                  <li>Templates de email profissionais com informações da vaga</li>
                  <li>Teste o envio de emails antes de ativar</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Plug className="h-4 w-4 text-purple-600" />
                  Integrações
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li><strong>Email (SMTP):</strong> Configure servidor SMTP para envio de emails
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Host, porta, usuário e senha</li>
                      <li>Email remetente personalizado</li>
                      <li>Suporte para Gmail, Outlook e outros provedores</li>
                    </ul>
                  </li>
                  <li><strong>WhatsApp (Twilio):</strong> Integração com Twilio WhatsApp Business API
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Account SID e Auth Token</li>
                      <li>Número do WhatsApp Business</li>
                      <li>Envio automático de notificações</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950/30 p-4 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <strong>Dica:</strong> Configure as integrações antes de ativar notificações para garantir que sejam enviadas corretamente.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Relatórios */}
        <AccordionItem value="reports" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <span className="text-lg font-semibold">Relatórios e Análises</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Análise detalhada de desempenho com métricas de recrutamento e relatórios personalizados.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Relatório de Fechamento de Vagas:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Ranking de recrutadores por vagas fechadas</li>
                <li>Tempo médio de fechamento por recrutador</li>
                <li>Salário médio das contratações</li>
                <li>Filtros por período, empresa e status</li>
                <li>Exportação para PDF, Excel e CSV</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Métricas de Performance:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Taxa de conversão de candidatos</li>
                <li>Tempo médio para contratação</li>
                <li>Custo por contratação</li>
                <li>Satisfação do candidato</li>
                <li>Gráficos de tendências e distribuição</li>
              </ul>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                <strong>Funcionalidade:</strong> Use os filtros para análises específicas e exporte os dados para apresentações e relatórios gerenciais.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Tips Card */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Dicas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>Atalhos:</strong> Use Ctrl+F para buscar rapidamente neste manual</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>Exportação:</strong> A maioria das páginas permite exportar dados para CSV</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>Filtros:</strong> Combine múltiplos filtros para análises mais precisas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>Busca:</strong> Use a busca em tempo real para encontrar registros rapidamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>Permissões:</strong> Configure permissões antes de adicionar novos usuários</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
