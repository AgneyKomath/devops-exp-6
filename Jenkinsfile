pipeline {
  agent any

  environment {
    DOCKERHUB_CRED = 'dockerhub-creds'   // the Jenkins credential id we'll create (change later if needed)
    DOCKERHUB_USER = 'ak47soma'       // <<-- REPLACE this with your Docker Hub username
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
              docker run -d --name _tmp_user -p 3001:3000 ${DOCKERHUB_USER}/user-service:${IMAGE_TAG}
              docker run -d --name _tmp_order -p 4001:4000 ${DOCKERHUB_USER}/order-service:${IMAGE_TAG}
              sleep 3
              curl -f http://localhost:3001/users
              curl -f http://localhost:4001/orders
              docker stop _tmp_user _tmp_order || true
              docker rm _tmp_user _tmp_order || true
            '''
          } else {
            bat '''
              docker run -d --name _tmp_user -p 3001:3000 %DOCKERHUB_USER%/user-service:%IMAGE_TAG%
              docker run -d --name _tmp_order -p 4001:4000 %DOCKERHUB_USER%/order-service:%IMAGE_TAG%
              timeout /t 3 /nobreak >NUL
              curl -f http://localhost:3001/users
              curl -f http://localhost:4001/orders
              docker stop _tmp_user _tmp_order || true
              docker rm _tmp_user _tmp_order || true
            '''
          }
        }
      }
    }

    stage('Push (skip if no creds)') {
      steps {
        echo "If you haven't added Docker Hub credentials in Jenkins yet, this stage will be skipped for now."
      }
    }
  }

  post {
    success { echo "Build ${IMAGE_TAG} finished (images built and smoke-tested locally)." }
    failure { echo "Pipeline failed — check console output." }
  }
}
