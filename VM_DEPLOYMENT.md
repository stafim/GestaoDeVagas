# Guia de Deployment - VagasPro na VM

Este documento contém todas as instruções para fazer o deploy do sistema VagasPro em uma VM com PostgreSQL.

## 📋 Pré-requisitos

### Software Necessário
- **Node.js**: versão 20.x ou superior
- **PostgreSQL**: versão 14 ou superior
- **npm**: versão 9.x ou superior
- **Git**: para clonar o repositório

### Portas Necessárias
- **5000**: Porta da aplicação (HTTP)
- **5432**: PostgreSQL (apenas localhost)

## 🗄️ Configuração do Banco de Dados

### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Criar Banco de Dados e Usuário

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE vagaspro;
CREATE USER vagaspro_user WITH ENCRYPTED PASSWORD 'sua_senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE vagaspro TO vagaspro_user;
\q
```

### 3. Restaurar o Dump do Banco

```bash
# Restaurar o dump (usar o arquivo mais recente)
psql -U vagaspro_user -d vagaspro -f database_dump_final_YYYYMMDD_HHMMSS.sql

# Se precisar usar com sudo:
sudo -u postgres psql -d vagaspro -f database_dump_final_YYYYMMDD_HHMMSS.sql
```

## 🚀 Instalação da Aplicação

### 1. Clonar o Repositório

```bash
cd /opt
git clone <URL_DO_REPOSITORIO> vagaspro
cd vagaspro
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Criar arquivo `.env`:

```bash
nano .env
```

Adicionar as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql://vagaspro_user:sua_senha_segura_aqui@localhost:5432/vagaspro
PGHOST=localhost
PGPORT=5432
PGDATABASE=vagaspro
PGUSER=vagaspro_user
PGPASSWORD=sua_senha_segura_aqui

# Node Environment
NODE_ENV=production

# Senior HCM Integration (opcional - configurar se usar integração)
SENIOR_API_URL=https://sua-api-senior.com
SENIOR_API_KEY=sua_chave_api_senior

# Session Secret (gerar uma chave forte)
SESSION_SECRET=$(openssl rand -base64 32)
```

### 4. Build da Aplicação

```bash
npm run build
```

## 🔧 Configuração do Servidor

### Opção 1: Systemd Service (Recomendado)

Criar arquivo de serviço:

```bash
sudo nano /etc/systemd/system/vagaspro.service
```

Conteúdo:

```ini
[Unit]
Description=VagasPro - Sistema de Gestão de Vagas
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/vagaspro
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Ativar e iniciar o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable vagaspro
sudo systemctl start vagaspro
sudo systemctl status vagaspro
```

### Opção 2: PM2 (Alternativa)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "vagaspro" -- start

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

## 🌐 Configuração do Nginx (Reverse Proxy)

### 1. Instalar Nginx

```bash
sudo apt install nginx
```

### 2. Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/vagaspro
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/vagaspro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configurar SSL com Let's Encrypt (Opcional mas Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br
```

## 🔒 Segurança

### 1. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. PostgreSQL

Editar `/etc/postgresql/14/main/pg_hba.conf`:

```
# Permitir apenas conexões locais
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Reiniciar PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## 📊 Monitoramento

### Logs da Aplicação

```bash
# Com systemd
sudo journalctl -u vagaspro -f

# Com PM2
pm2 logs vagaspro
```

### Logs do Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Logs do PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## 🔄 Atualizações

### Atualizar Código

```bash
cd /opt/vagaspro
git pull
npm install
npm run build
sudo systemctl restart vagaspro
```

### Atualizar Banco de Dados

```bash
cd /opt/vagaspro
npm run db:push
```

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
sudo journalctl -u vagaspro -n 50

# Verificar se porta 5000 está livre
sudo netstat -tulpn | grep 5000

# Testar conexão com banco
psql -U vagaspro_user -d vagaspro -c "SELECT 1"
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U vagaspro_user -d vagaspro
```

### Performance lenta

```bash
# Verificar uso de recursos
top
htop

# Verificar conexões do banco
psql -U vagaspro_user -d vagaspro -c "SELECT * FROM pg_stat_activity;"
```

## 📝 Checklist de Deployment

- [ ] PostgreSQL instalado e configurado
- [ ] Banco de dados criado
- [ ] Dump restaurado com sucesso
- [ ] Node.js 20+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Build executado (`npm run build`)
- [ ] Serviço systemd ou PM2 configurado
- [ ] Nginx instalado e configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Logs sendo monitorados
- [ ] Backup do banco configurado

## 🔐 Credenciais Padrão (IMPORTANTE: ALTERAR!)

Após o deployment, altere as senhas padrão:

1. Acesse `/usuarios`
2. Altere a senha do usuário administrador
3. Crie novos usuários conforme necessário

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa em `replit.md`.

---

**Data da última atualização**: 12/11/2025
**Versão do sistema**: 1.0.0
**Banco de dados**: PostgreSQL puro
