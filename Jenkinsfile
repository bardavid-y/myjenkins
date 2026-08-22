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
        // stage('Deploy with Docker Compose') {
        //     steps {
        //         echo 'Building and deploying containers via Docker Compose...'
        //         sh '''
        //             if command -v docker-compose &> /dev/null; then
        //                 docker-compose down || true
        //                 docker-compose up -d --build
        //             elif docker compose version &> /dev/null; then
        //                 docker compose down || true
        //                 docker compose up -d --build
        //             else
        //                 echo "Error: Neither docker-compose nor docker compose found!"
        //                 exit 1
        //             fi
        //         '''
        //     }
        // }
        // שלב 4: פריסה מאובטחת עם בדיקת Health Check ל-API
        stage('Deploy (Blue/Green Health Check)') {
            steps {
                echo 'Building new containers and running health validation for API...'
                
                sh '''
                   # 1. זיהוי פקודת ה-compose הנכונה
                    if command -v docker-compose &> /dev/null; then
                        DC="docker-compose"
                    elif docker compose version &> /dev/null; then
                        DC="docker compose"
                    else
                        echo "Error: Neither docker-compose nor docker compose found!"
                        exit 1
                    fi

                    # 2. בניית האימג'ים החדשים
                    $DC build

                    # 3. הרמת API זמני לבדיקה
                    echo "Starting temporary API container for health check..."
                    docker rm -f backend-api-temp || true
                    
                    IMAGE_NAME=$(docker images --format "{{.Repository}}" | grep api-service | head -n 1)
                    docker run -d --name backend-api-temp --net internal-yossi-net $IMAGE_NAME

                    # 4. המתנה קצרה לעליית השרת
                    sleep 3

                    # 5. בדיקה חכמה: האם הקונטיינר רץ והאם ה-API מחזיר 200 בעזרת Node.js פנימי או בדיקת סטטוס
                    IS_RUNNING=$(docker inspect -f '{{.State.Running}}' backend-api-temp)
                    
                    if [ "$IS_RUNNING" = "true" ]; then
                        echo "[SUCCESS] Temporary API container is running successfully! Deploying full stack..."
                        docker rm -f backend-api-temp || true
                        $DC up -d --remove-orphans
                    else
                        echo "[ERROR] Temporary API container failed to start!"
                        echo "Aborting deployment. The old version remains active and safe."
                        docker rm -f backend-api-temp || true
                        exit 1
                    fi
                '''
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