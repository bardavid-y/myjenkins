pipeline {
    agent any

    stages {
        // שלב 1: בדיקת תקינות הקוד מתוך Git
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // שלב 2: התקנת תלויות (Dependencies) ל-API
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies for API...'
                dir('api') {
                    sh 'npm install'
                }
            }
        }

        // שלב 3: הרצת בדיקות אוטומטיות (בעזרת assert)
        stage('Run Automated Tests') {
            steps {
                echo 'Starting API server in background for testing...'
                dir('api') {
                    // מריצים את השרת ברקע כדי שהטסט יוכל לפנות אליו
                    sh 'node server.js &'
                    // נותנים שניה לשרת לעלות
                    sleep 2
                    // הרצת הטסטים שיצרנו עם assert
                    sh 'npm test'
                }
            }
        }

        // שלב 4: בנייה והרמה מחדש של הקונטיינרים (Docker Compose)
        stage('Deploy with Docker Compose') {
            steps {
                echo 'Building and deploying containers via Docker Compose...'
                sh 'docker compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! All services are up and running.'
        }
        failure {
            echo 'Pipeline failed! Please check the logs above.'
        }
    }
}