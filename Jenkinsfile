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
            steps {echo 'בונים ומריצים מחדש את הקונטיינרים דרך Docker...'
                
                // יצירת הרשת הפנימית (אם לא קיימת)
                sh 'docker network create internal-yossi-net || true'
                
                // מחיקת קונטיינרים ישנים
                sh 'docker rm -f backend-api frontend-web ingress-gateway || true'
                
                // בנייה (עם הזרקת משתני סביבה לחותמת הבנייה)
                sh "docker build --build-arg VERSION=${BUILD_VER} --build-arg DATE=${BUILD_DATE} -t backend-api ./api"
                sh 'docker build -t frontend-web ./web'
                sh 'docker build -t ingress-gateway ./proxy'
                
                // הרצה בתוך הרשת הפנימית
                sh 'docker run -d --name backend-api --net internal-yossi-net -e PORT=3000 backend-api'
                sh 'docker run -d --name frontend-web --net internal-yossi-net frontend-web'
                
                // שער הכניסה הוא היחיד שחושף פורט 80 החוצה
                sh 'docker run -d --name ingress-gateway --net internal-yossi-net -p 80:80 ingress-gateway'
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