pipeline {
    stages {
        stage('dependencies') {
            steps {
                sh 'yarn install'
            }
        }
        stage('build') {
            steps {
                sh 'yarn build'
            }
        }
        stage('deploy') {
            steps {
                sh 'firebase deploy'
            }
        }
    }
}