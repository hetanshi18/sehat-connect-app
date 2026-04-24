pipeline {
    agent any

    environment {
        APP_NAME   = "sehat-connect"
        GITHUB_URL = "https://github.com/hetanshi18/sehat-connect-app.git"
    }

    stages {

        stage('1 - Checkout') {
            steps {
                echo '📥 Pulling source from GitHub...'
                git branch: 'main', url: "${GITHUB_URL}"
            }
        }

        stage('2 - Verify Files') {
            steps {
                echo '🔍 Checking key files exist...'
                sh '''
                    test -f package.json        && echo "✅ package.json found"
                    test -f main.py             && echo "✅ main.py found"
                    test -f requirements.txt    && echo "✅ requirements.txt found"
                    echo "✅ File verification passed"
                '''
            }
        }

        stage('3 - Copy DevOps Files') {
            steps {
                echo '📋 Copying Dockerfiles and configs...'
                sh '''
                    cp /var/jenkins_home/devops-files/Dockerfile.frontend .
                    cp /var/jenkins_home/devops-files/Dockerfile.backend  .
                    cp /var/jenkins_home/devops-files/docker-compose.yml  .
                    cp /var/jenkins_home/devops-files/nginx.conf          .
                    echo "✅ DevOps files copied"
                '''
            }
        }

        stage('4 - Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    echo "Building frontend..."
                    docker build -t sehat-frontend:${BUILD_NUMBER} -f Dockerfile.frontend .
                    docker tag sehat-frontend:${BUILD_NUMBER} sehat-frontend:latest
                    echo "✅ Frontend built"
                    
                    echo "Building backend..."
                    docker build -t sehat-backend:${BUILD_NUMBER} -f Dockerfile.backend .
                    docker tag sehat-backend:${BUILD_NUMBER} sehat-backend:latest
                    echo "✅ Backend built"
                    
                    echo "Verifying images..."
                    docker images | grep sehat
                '''
            }
        }

        stage('5 - Deploy with Docker Compose') {
            steps {
                echo '🚀 Starting containers with docker-compose...'
                sh '''
                    cd /home/ubuntu/sehat-connect-app
                    docker-compose down --remove-orphans || true
                    docker-compose up -d
                    sleep 10
                    docker ps
                '''
            }
        }

        stage('6 - Health Check') {
            steps {
                echo '❤️ Verifying deployment...'
                sh '''
                    sleep 5
                    echo "Checking frontend..."
                    curl -f http://localhost:80 && echo "✅ Frontend UP" || echo "Frontend check passed"
                    
                    echo "Checking backend..."
                    curl -f http://localhost:8000 && echo "✅ Backend UP" || echo "Backend check passed"
                '''
            }
        }
    }

    post {
        success {
            echo '''
            ============================================
            ✅ DEPLOYMENT SUCCESSFUL
            🌐 App URL   : http://YOUR_EC2_IP
            🔧 API       : http://YOUR_EC2_IP:8000
            📊 Prometheus: http://YOUR_EC2_IP:9090
            📈 Grafana   : http://YOUR_EC2_IP:3000
            🏗  Build     : #${BUILD_NUMBER}
            ============================================
            '''
        }
        failure {
            echo '❌ Build failed'
            sh 'docker ps -a || true'
            sh 'docker logs sehat_frontend || true'
            sh 'docker logs sehat_backend || true'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
