# project-cc (codename: codecanine)

## Project Setup (use sudo when needed)

### A. database (./db)
```
1. docker-compose up (MAKE SURE DOCKER IS RUNNING)
```

### B. server (./server)
```
1. npm install
2. npm install -g nodemon
3. npm install -g pm2
4. make .env file with the following:

    TOKEN_SECRET = xxx
    COOKIE_PARSER_SECRET = xxx
    BCRYPT_ROUNDS = 13
    DB_HOST=xxx
    DB_USER=xxx
    DB_PWD=xxx
    DB_DB=xxx

5. npm run server (run nodejs)
```

### C. client (./client)
```
1. npm install
2. npm install -g @vue/cli
3. npm run serve (run vuejs)
```

### REQUIRED INSTALLS
https://nodejs.org/en/download/
https://git-scm.com/downloads
https://docs.docker.com/get-docker/

### RECOMMENDED
https://code.visualstudio.com/
https://desktop.github.com/

### VSCODE RECOMMENDED INSTALLS
https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker
https://marketplace.visualstudio.com/items?itemName=octref.vetur


### other
```
npm run build (vuejs: Compiles and minifies for production)
npm run lint (vuejs: Lints and fixes files)
npm update OR npm ncu -u (npm: fix vulerabilities)
```

