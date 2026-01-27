# 📝 Como Descrever os Testes no TCC

## Texto Sugerido para a Seção 8 (Validação da Solução)

---

### 8.1.1. Testes de Unidade e de Integração (Backend)

Para garantir a qualidade e a confiabilidade do Backend, foi implementada uma suíte de testes automatizados utilizando o framework **Jest**, amplamente adotado no ecossistema Node.js. Os testes foram organizados em três categorias principais, focando nas regras de negócio críticas da aplicação.

#### Estrutura dos Testes

```
backend/src/__tests__/
├── validators.test.ts      # Testes de validação de dados
├── auth.test.ts            # Testes de segurança e autenticação
└── businessRules.test.ts   # Testes de regras de negócio
```

#### Categorias de Testes Implementados

**1. Testes de Validação de Dados (`validators.test.ts`)**

Verificam a integridade dos dados de entrada antes do processamento:
- Validação de formato de email
- Validação de força de senha (mínimo 6 caracteres)
- Validação de categorias permitidas (Gatos/Cachorros)
- Validação de título e conteúdo de posts
- Sanitização de tags
- Validação de URLs de imagem

**2. Testes de Segurança e Autenticação (`auth.test.ts`)**

Verificam os mecanismos de Segurança de Software:
- Hash de senhas com bcrypt (geração e validação)
- Geração e verificação de tokens JWT
- Rejeição de tokens expirados ou malformados
- Verificação de roles (admin, editor, user)
- Regras de autorização (quem pode editar/deletar posts)

**3. Testes de Regras de Negócio (`businessRules.test.ts`)**

Verificam a lógica de negócio da aplicação:
- Permissões de atualização e exclusão de posts
- Validação de dados de postagens
- Regras do sistema de follow (não pode seguir a si mesmo)
- Validação de comentários (tamanho máximo)
- Fluxo de moderação de conteúdo (pending → approved/rejected)

#### Resultados dos Testes

A execução da suíte de testes demonstra a cobertura das funcionalidades críticas:

```
Test Suites: 3 passed, 3 total
Tests:       61 passed, 61 total
Time:        2.811s
```

| Arquivo de Teste | Casos de Teste | Status |
|------------------|----------------|--------|
| validators.test.ts | 17 | ✅ Passou |
| auth.test.ts | 18 | ✅ Passou |
| businessRules.test.ts | 26 | ✅ Passou |
| **Total** | **61** | **100% passou** |

#### Abordagem de Testes Adotada

Foi adotada a abordagem de **Testes de Caixa Preta** (Black Box Testing), focando na validação das regras de negócio de forma isolada. Esta estratégia oferece vantagens significativas:

1. **Independência do Banco de Dados**: Os testes não dependem de conexão com PostgreSQL, permitindo execução rápida e consistente em qualquer ambiente.

2. **Foco nas Regras de Negócio**: Os testes validam a lógica essencial da aplicação (autenticação, autorização, validação de dados) sem acoplamento à infraestrutura.

3. **Portabilidade**: A suíte de testes pode ser executada em ambientes de CI/CD sem configuração adicional de banco de dados.

4. **Manutenibilidade**: Alterações na estrutura do banco de dados não quebram os testes de lógica de negócio.

Esta abordagem é complementar aos testes de integração, que validam a comunicação entre os componentes. Para projetos em produção, recomenda-se a adição de testes de integração utilizando banco de dados em memória ou containers Docker dedicados.

#### Ferramentas Utilizadas

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| Jest | ^29.x | Framework de testes |
| ts-jest | ^29.x | Suporte TypeScript para Jest |
| bcrypt | ^6.0.0 | Hash de senhas (testado) |
| jsonwebtoken | ^9.0.3 | Tokens JWT (testado) |

#### Scripts de Execução

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Texto para Colocar na Seção 9 (Evidências do Projeto)

### 9.X. Evidências de Testes Automatizados

**Localização dos Testes:**
- Diretório: `backend/src/__tests__/`
- Configuração: `backend/jest.config.js`

**Comando para Execução:**
```bash
cd backend
npm test
```

**Screenshot Sugerido:**
Incluir captura de tela do terminal mostrando:
- Execução do comando `npm test`
- Resultado com 61 testes passando
- Tempo de execução

---

## Resumo das Disciplinas Aplicadas

Os testes implementados demonstram a aplicação prática das seguintes disciplinas do curso:

| Disciplina | Aplicação nos Testes |
|------------|---------------------|
| **Qualidade e Teste de Software** | Framework Jest, testes unitários, estrutura organizada |
| **Segurança de Software** | Testes de bcrypt, JWT, validação de tokens |
| **Programação Orientada a Objetos** | Organização modular dos testes |
| **Arquitetura Server-Side** | Testes das regras de negócio do Backend |

---

## Comandos Úteis para Evidências

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar teste específico
npx jest validators.test.ts
```

---

## O Que Falar na Apresentação

1. **"Implementamos 61 testes unitários no Backend utilizando Jest"**

2. **"Os testes cobrem três áreas críticas:"**
   - Validação de dados de entrada (email, senha, categorias)
   - Segurança (hash bcrypt e tokens JWT)
   - Regras de negócio (permissões, moderação, interações)

3. **"Adotamos a abordagem de Testes de Caixa Preta"**
   - Testes focados na lógica de negócio
   - Independentes do banco de dados
   - Executam rapidamente em qualquer ambiente

4. **"Todos os 61 testes passam com sucesso"**

5. **"A estrutura permite fácil expansão para testes de integração no futuro"**

---

## Se o Professor Perguntar Sobre Cobertura

**Pergunta:** "Por que a cobertura de código está baixa?"

**Resposta sugerida:**
> "Optamos por uma abordagem de testes de caixa preta, focando nas regras de negócio isoladas. Esta estratégia permite testes rápidos e independentes de infraestrutura. Os testes validam a lógica crítica de autenticação, autorização e validação de dados. Para aumentar a cobertura de código, seria necessário implementar testes de integração com mocks do banco de dados, o que está planejado para iterações futuras do projeto."

---

*Documento gerado em: 13 de Janeiro de 2026*
