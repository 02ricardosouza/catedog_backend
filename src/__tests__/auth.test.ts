/**
 * Testes Unitários - Autenticação
 * 
 * Testes focados nas funções de segurança: 
 * hash de senhas e geração/verificação de tokens JWT.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-key';

describe('Segurança - Hash de Senhas (bcrypt)', () => {
    test('deve gerar hash diferente da senha original', async () => {
        const password = 'minhasenha123';
        const hash = await bcrypt.hash(password, 10);
        
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(password.length);
    });

    test('deve validar senha correta contra hash', async () => {
        const password = 'senhaSecreta456';
        const hash = await bcrypt.hash(password, 10);
        
        const isValid = await bcrypt.compare(password, hash);
        expect(isValid).toBe(true);
    });

    test('deve rejeitar senha incorreta', async () => {
        const password = 'senhaCorreta';
        const wrongPassword = 'senhaErrada';
        const hash = await bcrypt.hash(password, 10);
        
        const isValid = await bcrypt.compare(wrongPassword, hash);
        expect(isValid).toBe(false);
    });

    test('deve gerar hashes diferentes para mesma senha', async () => {
        const password = 'mesmaSenha123';
        const hash1 = await bcrypt.hash(password, 10);
        const hash2 = await bcrypt.hash(password, 10);
        
        // Hashes diferentes devido ao salt aleatório
        expect(hash1).not.toBe(hash2);
        
        // Mas ambos devem validar a mesma senha
        expect(await bcrypt.compare(password, hash1)).toBe(true);
        expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
});

describe('Segurança - Tokens JWT', () => {
    test('deve gerar token válido', () => {
        const payload = { userId: 1, email: 'teste@email.com', role: 'user' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT tem 3 partes
    });

    test('deve decodificar token e recuperar payload', () => {
        const payload = { userId: 42, email: 'usuario@blog.com', role: 'editor' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        expect(decoded.userId).toBe(payload.userId);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.role).toBe(payload.role);
    });

    test('deve rejeitar token com secret incorreto', () => {
        const payload = { userId: 1 };
        const token = jwt.sign(payload, JWT_SECRET);
        
        expect(() => {
            jwt.verify(token, 'wrong-secret');
        }).toThrow();
    });

    test('deve rejeitar token expirado', () => {
        const payload = { userId: 1 };
        // Token que expira em -1 segundo (já expirado)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
        
        expect(() => {
            jwt.verify(token, JWT_SECRET);
        }).toThrow('jwt expired');
    });

    test('deve rejeitar token malformado', () => {
        expect(() => {
            jwt.verify('token.invalido.aqui', JWT_SECRET);
        }).toThrow();
    });

    test('deve incluir informações de role no token', () => {
        // Simula criação de token como no authService
        const user = { id: 5, email: 'admin@blog.com', role: 'admin' };
        const token = jwt.sign(
            {
                userId: user.id,
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        expect(decoded.role).toBe('admin');
        expect(decoded.userId).toBe(5);
        expect(decoded.id).toBe(5);
    });
});

describe('Regras de Autorização', () => {
    // Funções que simulam verificações de autorização
    const authRules = {
        isAdmin: (role: string) => role === 'admin',
        isEditor: (role: string) => role === 'editor' || role === 'admin',
        canEditPost: (userId: number, postOwnerId: number, role: string) => {
            return userId === postOwnerId || role === 'admin';
        },
        canDeletePost: (userId: number, postOwnerId: number, role: string) => {
            return userId === postOwnerId || role === 'admin';
        },
        canModerate: (role: string) => role === 'admin'
    };

    describe('Verificação de Roles', () => {
        test('deve identificar admin corretamente', () => {
            expect(authRules.isAdmin('admin')).toBe(true);
            expect(authRules.isAdmin('editor')).toBe(false);
            expect(authRules.isAdmin('user')).toBe(false);
        });

        test('deve identificar editor corretamente', () => {
            expect(authRules.isEditor('editor')).toBe(true);
            expect(authRules.isEditor('admin')).toBe(true); // Admin também é editor
            expect(authRules.isEditor('user')).toBe(false);
        });
    });

    describe('Permissões de Post', () => {
        test('autor pode editar próprio post', () => {
            expect(authRules.canEditPost(1, 1, 'user')).toBe(true);
            expect(authRules.canEditPost(1, 1, 'editor')).toBe(true);
        });

        test('usuário não pode editar post de outro', () => {
            expect(authRules.canEditPost(1, 2, 'user')).toBe(false);
            expect(authRules.canEditPost(1, 2, 'editor')).toBe(false);
        });

        test('admin pode editar qualquer post', () => {
            expect(authRules.canEditPost(1, 2, 'admin')).toBe(true);
            expect(authRules.canEditPost(99, 1, 'admin')).toBe(true);
        });

        test('autor pode deletar próprio post', () => {
            expect(authRules.canDeletePost(5, 5, 'user')).toBe(true);
        });

        test('admin pode deletar qualquer post', () => {
            expect(authRules.canDeletePost(1, 999, 'admin')).toBe(true);
        });
    });

    describe('Permissões de Moderação', () => {
        test('apenas admin pode moderar', () => {
            expect(authRules.canModerate('admin')).toBe(true);
            expect(authRules.canModerate('editor')).toBe(false);
            expect(authRules.canModerate('user')).toBe(false);
        });
    });
});
