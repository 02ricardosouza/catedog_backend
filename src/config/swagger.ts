import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cat & Dog Blog API',
            version: '1.0.0',
            description: `
## API REST para o Blog Compartilhado de Bem-Estar Animal

Esta API fornece endpoints para gerenciar usuários, postagens, comentários, curtidas e sistema de follow.

### Recursos Principais:
- **Autenticação**: Registro e login com JWT
- **Posts**: CRUD completo de postagens
- **Interações**: Curtidas, comentários e follows
- **Moderação**: Sistema de aprovação de posts
- **Administração**: Gerenciamento de usuários e conteúdo

### Autenticação
A maioria dos endpoints requer autenticação via Bearer Token (JWT).
Faça login em \`/auth/login\` para obter o token.
            `,
            contact: {
                name: 'Ricardo Nunes de Souza',
                email: 'contato@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desenvolvimento'
            },
            {
                url: 'http://195.200.6.56:3000',
                description: 'Servidor de Produção (VPS)'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtido no login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', format: 'email', example: 'joao@email.com' },
                        role: { type: 'string', enum: ['reader', 'author', 'moderator', 'admin'], example: 'reader' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'Como cuidar do seu gato' },
                        content: { type: 'string', example: 'Conteúdo do post...' },
                        image_url: { type: 'string', example: 'https://example.com/image.jpg' },
                        category: { type: 'string', enum: ['Gatos', 'Cachorros'], example: 'Gatos' },
                        author_name: { type: 'string', example: 'João Silva' },
                        likesCount: { type: 'integer', example: 10 },
                        commentsCount: { type: 'integer', example: 5 },
                        isLikedByMe: { type: 'boolean', example: false },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
                        is_featured: { type: 'boolean', example: false },
                        tags: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Tag'
                            }
                        },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Tag: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'saude' },
                        color: { type: 'string', example: '#3b82f6' },
                        post_count: { type: 'integer', example: 15 }
                    }
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        content: { type: 'string', example: 'Ótimo post!' },
                        user_id: { type: 'integer', example: 1 },
                        post_id: { type: 'integer', example: 1 },
                        author: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                name: { type: 'string' }
                            }
                        },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'usuario@email.com' },
                        password: { type: 'string', format: 'password', example: 'senha123' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', format: 'email', example: 'joao@email.com' },
                        password: { type: 'string', format: 'password', minLength: 6, example: 'senha123' }
                    }
                },
                CreatePostRequest: {
                    type: 'object',
                    required: ['title', 'content', 'category'],
                    properties: {
                        title: { type: 'string', example: 'Dicas de alimentação para gatos' },
                        content: { type: 'string', example: 'Conteúdo completo do post...' },
                        category: { type: 'string', enum: ['Gatos', 'Cachorros'], example: 'Gatos' },
                        image_url: { type: 'string', example: 'https://example.com/image.jpg' },
                        tags: { type: 'array', items: { type: 'string' }, example: ['alimentacao', 'saude'] }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Mensagem de erro' }
                    }
                }
            }
        },
        tags: [
            { name: 'Autenticação', description: 'Endpoints de registro e login' },
            { name: 'Posts', description: 'CRUD de postagens' },
            { name: 'Interações', description: 'Curtidas, comentários e follows' },
            { name: 'Tags', description: 'Sistema de tags' },
            { name: 'Usuários', description: 'Perfis públicos e dados de usuários' },
            { name: 'Admin', description: 'Endpoints administrativos (requer role admin)' },
            { name: 'Administração', description: 'Moderação de posts (requer role admin)' }
        ]
    },
    apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

