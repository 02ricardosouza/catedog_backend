pipeline {
    agent any
    
    environment {
        // Nome do projeto
        PROJECT_NAME = 'blog_tcc_backend'
        
        // Credenciais do servidor VPS (configurar no Jenkins)
        SSH_CREDENTIAL_ID = 'jenkins-vps-key'
        
        // Configurações do servidor VPS
        VPS_HOST = '195.200.6.56'
        VPS_USER = 'root'
        
        // Diretório no VPS onde ficará o projeto
        DEPLOY_PATH = '/opt/blog_tcc_backend'
        
        // Branch para deploy em produção
        PRODUCTION_BRANCH = 'main'
    }
    
    options {
        // Manter apenas os últimos 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Timeout do pipeline
        timeout(time: 30, unit: 'MINUTES')
        
        // Timestamps nos logs
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonando repositório...'
                checkout scm
                
                script {
                    // Pegar informações do commit
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
                }
                
                echo "📝 Commit: ${env.GIT_COMMIT_MSG}"
                echo "👤 Autor: ${env.GIT_AUTHOR}"
                echo "🏷️  Versão: ${env.BUILD_VERSION}"
            }
        }
        
        stage('Environment Check') {
            steps {
                echo '� Verificando ambiente...'
                sh '''
                    echo "Node version: $(node --version)"
                    echo "npm version: $(npm --version)"
                    echo "Docker version: $(docker --version)"
                    echo "Docker Compose version: $(docker compose version)"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Instalando dependências...'
                nodejs('NodeJS 20.19.5') {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Lint & Security Check') {
            parallel {
                stage('Security Audit') {
                    steps {
                        echo '🔒 Auditoria de segurança...'
                        nodejs('NodeJS 20.19.5') {
                            sh 'npm audit --production || echo "⚠️  Vulnerabilidades encontradas"'
                        }
                    }
                }
                
                stage('Run Tests') {
                    steps {
                        echo '🧪 Executando testes...'
                        nodejs('NodeJS 20.19.5') {
                            sh 'npm test || echo "⚠️  Alguns testes falharam"'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🔨 Construindo imagem Docker...'
                script {
                    // Build da imagem com tag da versão
                    sh """
                        docker build -t ${PROJECT_NAME}:${BUILD_VERSION} .
                        docker tag ${PROJECT_NAME}:${BUILD_VERSION} ${PROJECT_NAME}:latest
                    """
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                echo '🧪 Testando imagem Docker...'
                script {
                    // Teste básico: verificar se a imagem foi criada corretamente
                    sh "docker images | grep ${PROJECT_NAME}"
                }
            }
        }
        
        stage('Deploy to VPS') {            
            steps {
                echo '🚀 Iniciando deploy para VPS...'
                
                script {
                    // Salvar imagem Docker como arquivo tar
                    sh """
                        docker save ${PROJECT_NAME}:latest | gzip > ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz
                    """
                    
                    // Usar credenciais do arquivo .env (Secret file)
                    withCredentials([file(credentialsId: 'BLOGTCC_ENV_FILE', variable: 'ENV_FILE')]) {
                        // Copiar o arquivo .env do Jenkins para o workspace
                        sh '''
                            echo "🔐 Copiando arquivo .env de produção..."
                            cp "$ENV_FILE" .env
                            chmod 600 .env
                        '''
                        
                        // Copiar arquivos necessários para o VPS
                        sshagent(credentials: ["${env.SSH_CREDENTIAL_ID}"]) {
                            sh """
                                # 1. Cria diretórios no VPS (incluindo o subdiretório 'database')
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "mkdir -p ${DEPLOY_PATH} ${DEPLOY_PATH}/database"
                                
                                # 2. Copiar arquivo .env
                                echo "📄 Copiando arquivo .env..."
                                scp -o StrictHostKeyChecking=no \
                                    .env \
                                    ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/.env
                                
                                # 3. Copiar docker-compose.yml
                                echo "📄 Copiando docker-compose.yml..."
                                scp -o StrictHostKeyChecking=no \
                                    docker-compose.yml \
                                    ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/docker-compose.yml
                                
                                # 4. Copiar imagem Docker
                                echo "📦 Copiando imagem Docker..."
                                scp -o StrictHostKeyChecking=no \
                                    ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz \
                                    ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/
                                
                                # 5. Copiar migrations (se existirem, caso contrário continua)
                                echo "📊 Copiando migrations..."
                                scp -o StrictHostKeyChecking=no -r \
                                    database/migrations \
                                    ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/database/ || true
                            """
                        }
                        
                        // Remover .env do workspace por segurança
                        sh 'rm -f .env'
                    }
                }
            }
        }
        
        stage('Run Deployment on VPS') {            
            steps {
                echo '⚙️  Executando deploy no servidor...'
                
                sshagent(credentials: ["${env.SSH_CREDENTIAL_ID}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                            cd ${DEPLOY_PATH}
                            
                            # Carregar imagem Docker
                            echo "� Carregando imagem Docker..."
                            gunzip -c ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz | docker load
                            
                            # Parar containers antigos
                            echo "🛑 Parando containers antigos..."
                            docker compose down || true
                            
                            # Remover imagem antiga
                            docker image prune -f
                            
                            # Iniciar novos containers
                            echo "🚀 Iniciando novos containers..."
                            docker compose up -d
                            
                            # Aguardar containers ficarem healthy
                            echo "⏳ Aguardando serviços ficarem prontos..."
                            sleep 15
                            
                            # Executar migrations (o container backend executa migrations no prestart)
                            echo "📊 Migrations executam automaticamente no startup do container..."
                            
                            # Verificar status
                            echo "✅ Status dos containers:"
                            docker compose ps
                            
                            # Limpar arquivo tar
                            rm -f ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz
                        '
                    """
                }
            }
        }
        
        stage('Health Check') {            
            steps {
                echo '🏥 Verificando saúde da aplicação...'
                
                sshagent(credentials: ["${env.SSH_CREDENTIAL_ID}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                            cd ${DEPLOY_PATH}
                            
                            # Verificar se o container está rodando
                            echo "📦 Verificando container..."
                            docker compose ps
                            
                            # Ver logs do container backend
                            echo "📋 Logs do container (últimas 30 linhas):"
                            docker compose logs --tail 30 backend
                            
                            # Verificar se o container está realmente rodando (não em restart)
                            if ! docker compose ps backend | grep -q "Up"; then
                                echo "❌ Container não está em execução normal!"
                                docker compose logs --tail 100 backend
                                exit 1
                            fi
                            
                            # Aguardar aplicação iniciar completamente
                            echo "⏳ Aguardando aplicação iniciar (20 segundos)..."
                            sleep 20
                            
                            # Tentar health check com retry
                            echo "🔍 Testando endpoint de health..."
                            for i in 1 2 3 4 5; do
                                echo "Tentativa \$i/5..."
                                if curl -f http://localhost:3000/health 2>/dev/null; then
                                    echo ""
                                    echo "✅ Aplicação está saudável!"
                                    exit 0
                                fi
                                sleep 5
                            done
                            
                            echo ""
                            echo "❌ Health check falhou após 5 tentativas"
                            echo "📋 Logs completos do container:"
                            docker compose logs --tail 100 backend
                            exit 1
                        '
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline executado com sucesso!'
            
            // Limpar imagem local
            sh "rm -f ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz"
        }
        
        failure {
            echo '❌ Pipeline falhou!'
            
            // Limpar arquivos temporários
            sh "rm -f ${PROJECT_NAME}-${BUILD_VERSION}.tar.gz || true"
        }
        
        always {
            echo '🧹 Limpando workspace...'
            
            // Limpar imagens Docker antigas do projeto (manter apenas as 3 mais recentes)
            sh '''
                docker images ${PROJECT_NAME} --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f 2>/dev/null || true
            '''
            
            // Limpar containers parados
            sh 'docker container prune -f || true'
            
            // Limpar imagens dangling (sem tag)
            sh 'docker image prune -f || true'
        }
    }
}
