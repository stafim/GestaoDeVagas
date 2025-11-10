/**
 * Email Service - Handles sending emails
 * 
 * For production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Nodemailer with SMTP
 */

import { generateStatusChangeEmail } from './emailTemplates';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface StatusChangeEmailParams {
  recipients: EmailRecipient[];
  jobData: {
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
    salaryMin?: number;
    salaryMax?: number;
  };
}

class EmailService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Send status change notification email
   */
  async sendStatusChangeNotification(params: StatusChangeEmailParams): Promise<void> {
    const { recipients, jobData } = params;

    // Format salary range if available
    let salaryRange: string | undefined;
    if (jobData.salaryMin || jobData.salaryMax) {
      const formatCurrency = (value?: number) => {
        if (!value) return 'Não informado';
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      };

      if (jobData.salaryMin && jobData.salaryMax) {
        salaryRange = `${formatCurrency(jobData.salaryMin)} - ${formatCurrency(jobData.salaryMax)}`;
      } else if (jobData.salaryMin) {
        salaryRange = `A partir de ${formatCurrency(jobData.salaryMin)}`;
      } else if (jobData.salaryMax) {
        salaryRange = `Até ${formatCurrency(jobData.salaryMax)}`;
      }
    }

    // Generate HTML email
    const htmlContent = generateStatusChangeEmail({
      ...jobData,
      salaryRange,
    });

    // Email subject
    const subject = `🔔 Status Alterado: ${jobData.jobCode} - ${jobData.newStatus}`;

    // In development, log the email instead of sending
    if (this.isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL DE NOTIFICAÇÃO DE STATUS');
      console.log('='.repeat(80));
      console.log(`Para: ${recipients.map(r => `${r.name || 'N/A'} <${r.email}>`).join(', ')}`);
      console.log(`Assunto: ${subject}`);
      console.log('-'.repeat(80));
      console.log('Conteúdo (HTML gerado):');
      console.log(`Tamanho: ${htmlContent.length} caracteres`);
      console.log('-'.repeat(80));
      console.log('Detalhes da Mudança:');
      console.log(`  Vaga: ${jobData.jobCode} - ${jobData.jobTitle}`);
      console.log(`  Empresa: ${jobData.companyName}`);
      console.log(`  Status: ${jobData.previousStatus} → ${jobData.newStatus}`);
      console.log(`  Alterado por: ${jobData.changedBy}`);
      console.log(`  Data: ${jobData.changedAt.toLocaleString('pt-BR')}`);
      console.log('='.repeat(80) + '\n');

      // Save email to file for preview
      if (process.env.SAVE_EMAIL_PREVIEW === 'true') {
        const fs = require('fs');
        const path = require('path');
        const emailDir = path.join(process.cwd(), 'temp_emails');
        
        if (!fs.existsSync(emailDir)) {
          fs.mkdirSync(emailDir, { recursive: true });
        }

        const filename = `email_${jobData.jobCode}_${Date.now()}.html`;
        const filepath = path.join(emailDir, filename);
        fs.writeFileSync(filepath, htmlContent);
        console.log(`💾 Preview do email salvo em: ${filepath}`);
      }

      return;
    }

    // TODO: In production, integrate with email service
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: recipients.map(r => ({ email: r.email, name: r.name })),
      from: {
        email: process.env.FROM_EMAIL || 'noreply@vagaspro.com',
        name: 'VagasPro - Sistema de Gestão de Vagas'
      },
      subject: subject,
      html: htmlContent,
    };

    await sgMail.sendMultiple(msg);
    */

    // For now, just log in production too
    console.log(`📧 Email would be sent to: ${recipients.map(r => r.email).join(', ')}`);
    console.log(`   Subject: ${subject}`);
  }

  /**
   * Send test email for development/testing
   */
  async sendTestEmail(recipientEmail: string): Promise<void> {
    await this.sendStatusChangeNotification({
      recipients: [{ email: recipientEmail, name: 'Usuário Teste' }],
      jobData: {
        jobCode: 'TESTE-001',
        jobTitle: 'Desenvolvedor Full Stack Sênior',
        companyName: 'Tech Innovations LTDA',
        location: 'São Paulo - SP',
        previousStatus: 'Nova Vaga',
        newStatus: 'Em Recrutamento',
        statusColor: '#10b981',
        changedBy: 'Admin Sistema',
        changedAt: new Date(),
        recruiterName: 'Maria Recrutadora',
        creatorName: 'João Gestor',
        contractType: 'CLT',
        salaryMin: 8000,
        salaryMax: 12000,
      },
    });
  }
}

export const emailService = new EmailService();
