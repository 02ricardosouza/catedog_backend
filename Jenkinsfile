pipeline {
    agent any
    
    environment {
        COMPOSE_PROJECT_NAME = 'animal_blog_backend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out backend code from GitHub...'
                checkout scm
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment variables...'
                withCredentials([
                    string(credentialsId: 'DB_USER', variable: 'DB_USER'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'DB_NAME', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                ]) {
                    sh '''
                        cat > .env <<EOF
DB_HOST=db
DB_PORT=5432
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
BACKEND_PORT=3000
EOF
                    '''
                }
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                echo '🛑 Stopping old containers...'
                sh 'docker-compose down || true'
            }
        }
        
        stage('Build') {
            steps {
                echo '🏗️ Building backend Docker image...'
                sh 'docker-compose build --no-cache'
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying backend (migrations run automatically on startup)...'
                sh 'docker-compose up -d'
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health check...'
                script {
                    def maxRetries = 10
                    def retryInterval = 5
                    def healthy = false
                    
                    for (int i = 0; i < maxRetries; i++) {
                        sleep retryInterval
                        def result = sh(script: 'curl -sf http://localhost:3000/health', returnStatus: true)
                        if (result == 0) {
                            healthy = true
                            break
                        }
                        echo "Attempt ${i + 1}/${maxRetries} failed, retrying..."
                    }
                    
                    if (!healthy) {
                        error('Health check failed after maximum retries')
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old Docker resources...'
                sh 'docker system prune -f --volumes --filter "until=24h" || true'
            }
        }
    }
    
    post {
        success {
            echo '✅ Backend deployment successful!'
        }
        failure {
            echo '❌ Backend deployment failed!'
            sh 'docker-compose logs --tail=100 || true'
        }
        always {
            sh 'rm -f .env || true'
        }
    }
}
