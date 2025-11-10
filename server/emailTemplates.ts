/**
 * Email Templates for Job Status Change Notifications
 */

interface JobStatusEmailData {
  jobCode: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  previousStatus: string;
  newStatus: string;
  statusColor?: string;
  changedBy: string;
  changedAt: Date;
  recruiterName?: string;
  creatorName?: string;
  jobType?: string;
  contractType?: string;
  salaryRange?: string;
}

export function generateStatusChangeEmail(data: JobStatusEmailData): string {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(data.changedAt);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alteração de Status - ${data.jobCode}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .status-change-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin: 5px 5px 5px 0;
    }
    .status-from {
      background-color: #e9ecef;
      color: #495057;
    }
    .status-to {
      background-color: ${data.statusColor || '#667eea'};
      color: white;
    }
    .arrow {
      display: inline-block;
      margin: 0 10px;
      color: #6c757d;
      font-size: 18px;
    }
    .info-grid {
      display: table;
      width: 100%;
      margin: 25px 0;
    }
    .info-row {
      display: table-row;
    }
    .info-label {
      display: table-cell;
      padding: 12px 15px 12px 0;
      font-weight: 600;
      color: #495057;
      width: 40%;
      vertical-align: top;
    }
    .info-value {
      display: table-cell;
      padding: 12px 0;
      color: #212529;
      vertical-align: top;
    }
    .divider {
      height: 1px;
      background-color: #dee2e6;
      margin: 25px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      margin: 20px 0;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .info-label,
      .info-value {
        display: block;
        width: 100%;
        padding: 8px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔔 Alteração de Status</h1>
      <p>Sistema de Gestão de Vagas - VagasPro</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="font-size: 16px; color: #212529; margin-top: 0;">
        Olá! 👋
      </p>
      <p style="font-size: 16px; color: #212529;">
        Uma vaga que você está acompanhando teve seu status alterado. Confira os detalhes abaixo:
      </p>

      <!-- Status Change Box -->
      <div class="status-change-box">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #495057; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          Mudança de Status
        </p>
        <div style="text-align: center;">
          <span class="status-badge status-from">${data.previousStatus}</span>
          <span class="arrow">→</span>
          <span class="status-badge status-to">${data.newStatus}</span>
        </div>
      </div>

      <!-- Job Information -->
      <h2 style="color: #212529; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
        📋 Informações da Vaga
      </h2>

      <div class="info-grid">
        <div class="info-row">
          <div class="info-label">Código da Vaga:</div>
          <div class="info-value"><strong>${data.jobCode}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Profissão:</div>
          <div class="info-value">${data.jobTitle}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Empresa:</div>
          <div class="info-value">${data.companyName}</div>
        </div>
        ${data.location ? `
        <div class="info-row">
          <div class="info-label">Localização:</div>
          <div class="info-value">${data.location}</div>
        </div>
        ` : ''}
        ${data.contractType ? `
        <div class="info-row">
          <div class="info-label">Tipo de Contrato:</div>
          <div class="info-value">${data.contractType.toUpperCase()}</div>
        </div>
        ` : ''}
        ${data.salaryRange ? `
        <div class="info-row">
          <div class="info-label">Faixa Salarial:</div>
          <div class="info-value">${data.salaryRange}</div>
        </div>
        ` : ''}
      </div>

      <div class="divider"></div>

      <!-- Change Details -->
      <div class="info-grid">
        <div class="info-row">
          <div class="info-label">Alterado por:</div>
          <div class="info-value">${data.changedBy}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Data/Hora:</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        ${data.recruiterName ? `
        <div class="info-row">
          <div class="info-label">Recrutador:</div>
          <div class="info-value">${data.recruiterName}</div>
        </div>
        ` : ''}
        ${data.creatorName ? `
        <div class="info-row">
          <div class="info-label">Gestor:</div>
          <div class="info-value">${data.creatorName}</div>
        </div>
        ` : ''}
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}" class="button">
          Ver Vaga no Sistema
        </a>
      </div>

      <div class="alert-box">
        <strong>💡 Dica:</strong> Você está recebendo este email porque as notificações estão ativadas para mudanças para o status "<strong>${data.newStatus}</strong>". 
        Para gerenciar suas preferências de notificação, acesse Configurações > Notificações no sistema.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>VagasPro - Sistema de Gestão de Vagas</strong></p>
      <p>Gente&Pessoas | Gestão de Talentos</p>
      <p style="font-size: 12px; margin-top: 15px;">
        Este é um email automático. Por favor, não responda.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateTestEmail(): string {
  return generateStatusChangeEmail({
    jobCode: 'VAGA-2024-001',
    jobTitle: 'Desenvolvedor Full Stack',
    companyName: 'Tech Solutions LTDA',
    location: 'São Paulo - SP',
    previousStatus: 'Nova Vaga',
    newStatus: 'Em Recrutamento',
    statusColor: '#10b981',
    changedBy: 'João Silva',
    changedAt: new Date(),
    recruiterName: 'Maria Santos',
    creatorName: 'Pedro Oliveira',
    contractType: 'clt',
    salaryRange: 'R$ 8.000,00 - R$ 12.000,00',
  });
}
