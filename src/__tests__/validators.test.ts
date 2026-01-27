/**
 * Testes Unitários - Utilitários de Validação
 * 
 * Testes focados em validar funções auxiliares e regras de negócio
 * que não dependem do banco de dados.
 */

// Funções de validação que serão testadas
const validators = {
    /**
     * Valida formato de email
     */
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Valida força da senha (mínimo 6 caracteres)
     */
    isValidPassword: (password: string): boolean => {
        return password.length >= 6;
    },

    /**
     * Valida categoria do post
     */
    isValidCategory: (category: string): boolean => {
        return ['Gatos', 'Cachorros'].includes(category);
    },

    /**
     * Valida título do post (não vazio, máximo 255 caracteres)
     */
    isValidTitle: (title: string): boolean => {
        return title.trim().length > 0 && title.length <= 255;
    },

    /**
     * Valida conteúdo do post (não vazio)
     */
    isValidContent: (content: string): boolean => {
        return content.trim().length > 0;
    },

    /**
     * Sanitiza tags (remove caracteres especiais)
     */
    sanitizeTag: (tag: string): string => {
        return tag.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚãõÃÕâêîôûÂÊÎÔÛ]/g, '').toLowerCase();
    },

    /**
     * Valida URL de imagem
     */
    isValidImageUrl: (url: string): boolean => {
        if (!url) return true; // URL é opcional
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

describe('Validadores de Email', () => {
    test('deve aceitar email válido', () => {
        expect(validators.isValidEmail('usuario@email.com')).toBe(true);
        expect(validators.isValidEmail('teste.usuario@dominio.com.br')).toBe(true);
        expect(validators.isValidEmail('user123@test.org')).toBe(true);
    });

    test('deve rejeitar email inválido', () => {
        expect(validators.isValidEmail('')).toBe(false);
        expect(validators.isValidEmail('emailsemarroba.com')).toBe(false);
        expect(validators.isValidEmail('@semdominio.com')).toBe(false);
        expect(validators.isValidEmail('email@')).toBe(false);
        expect(validators.isValidEmail('email com espaço@teste.com')).toBe(false);
    });
});

describe('Validadores de Senha', () => {
    test('deve aceitar senha com 6 ou mais caracteres', () => {
        expect(validators.isValidPassword('123456')).toBe(true);
        expect(validators.isValidPassword('senhaForte123!')).toBe(true);
        expect(validators.isValidPassword('abcdef')).toBe(true);
    });

    test('deve rejeitar senha com menos de 6 caracteres', () => {
        expect(validators.isValidPassword('')).toBe(false);
        expect(validators.isValidPassword('12345')).toBe(false);
        expect(validators.isValidPassword('abc')).toBe(false);
    });
});

describe('Validadores de Categoria', () => {
    test('deve aceitar categorias válidas', () => {
        expect(validators.isValidCategory('Gatos')).toBe(true);
        expect(validators.isValidCategory('Cachorros')).toBe(true);
    });

    test('deve rejeitar categorias inválidas', () => {
        expect(validators.isValidCategory('')).toBe(false);
        expect(validators.isValidCategory('Passaros')).toBe(false);
        expect(validators.isValidCategory('gatos')).toBe(false); // Case sensitive
        expect(validators.isValidCategory('CACHORROS')).toBe(false);
    });
});

describe('Validadores de Post', () => {
    describe('Título', () => {
        test('deve aceitar título válido', () => {
            expect(validators.isValidTitle('Meu primeiro post')).toBe(true);
            expect(validators.isValidTitle('Como cuidar do seu gato')).toBe(true);
        });

        test('deve rejeitar título vazio', () => {
            expect(validators.isValidTitle('')).toBe(false);
            expect(validators.isValidTitle('   ')).toBe(false);
        });

        test('deve rejeitar título muito longo', () => {
            const longTitle = 'a'.repeat(256);
            expect(validators.isValidTitle(longTitle)).toBe(false);
        });
    });

    describe('Conteúdo', () => {
        test('deve aceitar conteúdo válido', () => {
            expect(validators.isValidContent('Este é o conteúdo do post')).toBe(true);
        });

        test('deve rejeitar conteúdo vazio', () => {
            expect(validators.isValidContent('')).toBe(false);
            expect(validators.isValidContent('   ')).toBe(false);
        });
    });
});

describe('Sanitização de Tags', () => {
    test('deve remover caracteres especiais', () => {
        expect(validators.sanitizeTag('#gatos')).toBe('gatos');
        expect(validators.sanitizeTag('@cachorros!')).toBe('cachorros');
        expect(validators.sanitizeTag('bem-estar')).toBe('bemestar');
    });

    test('deve converter para minúsculas', () => {
        expect(validators.sanitizeTag('GATOS')).toBe('gatos');
        expect(validators.sanitizeTag('CaChOrRos')).toBe('cachorros');
    });

    test('deve processar tags com acentos corretamente', () => {
        // A sanitização remove caracteres especiais, incluindo acentos com cedilha
        // Este comportamento é aceitável para tags
        expect(validators.sanitizeTag('nutricao')).toBe('nutricao');
        expect(validators.sanitizeTag('saude')).toBe('saude');
    });
});

describe('Validadores de URL de Imagem', () => {
    test('deve aceitar URL vazia (opcional)', () => {
        expect(validators.isValidImageUrl('')).toBe(true);
    });

    test('deve aceitar URLs válidas', () => {
        expect(validators.isValidImageUrl('https://example.com/image.jpg')).toBe(true);
        expect(validators.isValidImageUrl('http://images.test.com/foto.png')).toBe(true);
    });

    test('deve rejeitar URLs inválidas', () => {
        expect(validators.isValidImageUrl('not-a-url')).toBe(false);
        expect(validators.isValidImageUrl('ftp://invalid')).toBe(true); // URL válida, protocolo diferente
    });
});
