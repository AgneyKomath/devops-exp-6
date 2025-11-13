pipeline {
  agent any

  environment {
    DOCKERHUB_CRED = 'dockerhub-creds'   // change if different
    DOCKERHUB_USER = 'ak47soma'       // change to your Docker Hub username
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build images') {
      steps {
        script {
          if (isUnix()) {
            sh "docker build -t ${DOCKERHUB_USER}/user-service:${IMAGE_TAG} ./user-service"
            sh "docker build -t ${DOCKERHUB_USER}/order-service:${IMAGE_TAG} ./order-service"
          } else {
            // Windows: use names that start with a letter, not underscore
            bat "docker build -t %DOCKERHUB_USER%/user-service:%IMAGE_TAG% .\\user-service"
            bat "docker build -t %DOCKERHUB_USER%/order-service:%IMAGE_TAG% .\\order-service"
          }
        }
      }
    }

    stage('Smoke test') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              docker rm -f tmpuser 2>/dev/null || true
              docker rm -f tmporder 2>/dev/null || true
              docker run -d --name tmpuser -p 3001:3000 ${DOCKERHUB_USER}/user-service:${IMAGE_TAG}
              docker run -d --name tmporder -p 4001:4000 ${DOCKERHUB_USER}/order-service:${IMAGE_TAG}
              sleep 3
              curl -f http://localhost:3001/users
              curl -f http://localhost:4001/orders
              docker stop tmpuser tmporder || true
              docker rm tmpuser tmporder || true
            '''
          } else {
            // Windows batch: use names starting with letter, and suppress non-fatal errors
            bat '''
              docker rm -f tmpuser 2>nul || echo.
              docker rm -f tmporder 2>nul || echo.
              docker run -d --name tmpuser -p 3001:3000 %DOCKERHUB_USER%/user-service:%IMAGE_TAG%
              docker run -d --name tmporder -p 4001:4000 %DOCKERHUB_USER%/order-service:%IMAGE_TAG%
              timeout /t 3 /nobreak >NUL
              curl -f http://localhost:3001/users
              curl -f http://localhost:4001/orders
              docker stop tmpuser tmporder 2>nul || echo.
              docker rm tmpuser tmporder 2>nul || echo.
            '''
          }
        }
      }
    }

    stage('Push (skip if no creds)') {
      steps {
        echo "Push stage skipped in this Jenkinsfile version. Add Push/Deploy later."
      }
    }
  }

  post {
    success { echo "Build ${IMAGE_TAG} finished (images built and smoke-tested locally)." }
    failure { echo "Pipeline failed — check console output." }
  }
}
