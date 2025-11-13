pipeline {
  agent any
  environment {
    DOCKERHUB_CRED = 'dockerhub-creds'
    DOCKERHUB_USER = 'ak47soma'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Build images') {
      steps {
        script {
          if (isUnix()) {
            sh "docker build -t ${DOCKERHUB_USER}/user-service:${IMAGE_TAG} ./user-service"
            sh "docker build -t ${DOCKERHUB_USER}/order-service:${IMAGE_TAG} ./order-service"
          } else {
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

    stage('Push images & Deploy') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          script {
            if (isUnix()) {
              sh '''
                echo $DH_PASS | docker login -u $DH_USER --password-stdin
                docker push ${DOCKERHUB_USER}/user-service:${IMAGE_TAG}
                docker push ${DOCKERHUB_USER}/order-service:${IMAGE_TAG}
                docker compose pull || true
                docker compose up -d --build
              '''
            } else {
              bat '''
                powershell -Command "$env:DH_PASS | docker login -u %DH_USER% --password-stdin"
                docker push %DOCKERHUB_USER%/user-service:%IMAGE_TAG%
                docker push %DOCKERHUB_USER%/order-service:%IMAGE_TAG%
                docker compose pull || echo.
                docker compose up -d --build
              '''
            }
          }
        }
      }
    }
  }

  post {
    success { echo "Pipeline succeeded — build ${IMAGE_TAG} pushed and deployed." }
    failure { echo "Pipeline failed — check console output." }
  }
}
