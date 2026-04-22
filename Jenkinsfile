pipeline {
    agent any

    environment {
        APP_NAME   = "sehat-connect"
        GITHUB_URL = "https://github.com/hetanshi18/sehat-connect-app.git"
        EC2_USER   = "ubuntu"
        APP_DIR    = "/home/ubuntu/sehat-connect-app"
    }

    stages {

        stage('1 - Checkout') {
            steps {
                echo '📥 Pulling source from GitHub...'
                git branch: 'main', url: "${GITHUB_URL}"
            }
        }

        stage('2 - Lint & Verify') {
            steps {
                echo '🔍 Checking key files exist...'
                sh '''
                    test -f package.json   && echo "✅ package.json found"
                    test -f main.py        && echo "✅ main.py found"
                    test -f requirements.txt && echo "✅ requirements.txt found"
                    echo "✅ Lint/verify passed"
                '''
            }
        }

        stage('3 - Copy DevOps Files') {
            steps {
                echo '📋 Copying Dockerfiles and configs into workspace...'
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
                    docker build -t sehat-frontend:${BUILD_NUMBER} -f Dockerfile.frontend .
                    docker build -t sehat-backend:${BUILD_NUMBER}  -f Dockerfile.backend  .
                    docker tag sehat-frontend:${BUILD_NUMBER} sehat-frontend:latest
                    docker tag sehat-backend:${BUILD_NUMBER}  sehat-backend:latest
                    echo "✅ Images built"
                    docker images | grep sehat
                '''
            }
        }

        stage('5 - Deploy with Ansible') {
            steps {
                echo '🚀 Running Ansible playbook to deploy containers...'
                sh '''
                    cd /var/jenkins_home/devops-files/ansible
                    ansible-playbook -i inventory.ini deploy.yml -v
                '''
            }
        }

        stage('6 - Health Check') {
            steps {
                echo '❤️  Verifying deployment...'
                sh '''
                    sleep 10
                    # Check frontend
                    curl -f http://localhost:80 && echo "✅ Frontend UP"
                    # Check backend
                    curl -f http://localhost:8000 && echo "✅ Backend UP"
                '''
            }
        }
    }

    post {
        success {
            echo """
            ============================================
            ✅ DEPLOYMENT SUCCESSFUL
            🌐 App URL : http://\${EC2_PUBLIC_IP}
            🔧 Backend  : http://\${EC2_PUBLIC_IP}:8000
            🏗  Build   : #\${BUILD_NUMBER}
            ============================================
            """
        }
        failure {
            echo '❌ Build failed. Check console output above.'
            sh 'docker ps -a'
            sh 'docker logs sehat_frontend || true'
            sh 'docker logs sehat_backend  || true'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
