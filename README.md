# ANIMAL Blog - Backend API

API REST para o blog compartilhado de bem-estar animal. Desenvolvido com Node.js, TypeScript, Express e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Docker** - Containerização

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (desenvolvimento local)
- PostgreSQL 15+ (desenvolvimento local)

## 🏃 Como Rodar

### Com Docker (Recomendado)

```bash
# Produção
docker-compose up -d --build

# Desenvolvimento (hot-reload)
docker-compose -f docker-compose.dev.yml up -d --build

# Usando script de deploy
./deploy.sh
```

### Desenvolvimento Local

```bash
npm install
npm run dev  # Migrations rodam automaticamente
```

## 🔄 Migrations

### Automáticas
Migrations executam automaticamente ao iniciar o servidor.

### Manual
```bash
npm run migrate
```

### Criar Nova Migration
```bash
npm run migrate:create nome_da_migration
```

## 🔑 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASSWORD=your_password
DB_NAME=animal_blog
JWT_SECRET=your_secret_key
BACKEND_PORT=3000
```

## 📡 Endpoints da API

### Autenticação
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login

### Posts
- `GET /posts` - Listar posts
- `GET /posts/:id` - Detalhes do post
- `POST /posts` - Criar post (autenticado)
- `PUT /posts/:id` - Editar post (autenticado)
- `DELETE /posts/:id` - Deletar post (autenticado)

### Interações
- `POST /posts/:id/like` - Curtir/descurtir
- `GET /posts/:id/comments` - Listar comentários
- `POST /posts/:id/comments` - Adicionar comentário
- `POST /users/:id/follow` - Seguir usuário

## 🐳 Docker

### Portas
- Backend: `3000`
- Database: `5432`

### Volumes
- `pgdata` - Dados do PostgreSQL

## 🤖 CI/CD com Jenkins

Este projeto está configurado para deploy automático via Jenkins.

### Configuração

1. Configure credenciais no Jenkins:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`

2. Configure webhook no GitHub:
   - URL: `http://seu-jenkins:8080/github-webhook/`

3. Push no repositório dispara deploy automático

### Pipeline

O `Jenkinsfile` executa:
1. Checkout do código
2. Setup de variáveis
3. Build da imagem Docker
4. Execução de migrations
5. Deploy do backend
6. Health checks

## 📊 Logs

```bash
# Todos os serviços
docker-compose logs -f

# Backend apenas
docker-compose logs -f backend

# Database apenas
docker-compose logs -f db
```

## 🧪 Testes

```bash
chmod +x scripts/test_api.sh
./scripts/test_api.sh
```

## 📝 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações
│   ├── controllers/    # Controllers
│   ├── services/       # Lógica de negócio
│   ├── repositories/   # Acesso a dados
│   ├── routes/         # Rotas da API
│   ├── middlewares/    # Middlewares
│   ├── migrate.ts      # Migration runner
│   └── app.ts          # App Express
├── database/
│   └── migrations/     # SQL migrations
├── scripts/
│   ├── create-migration.js
│   ├── start.sh
│   └── test_api.sh
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── deploy.sh
├── Jenkinsfile
└── .env.example
```

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Autenticação via JWT
- Validação de entrada
- CORS configurado
- Variáveis de ambiente protegidas

## 📄 Licença

TCC - Pós-Graduação em Desenvolvimento Full Stack
