# Project-CodeCanine

## Project Setup (use sudo when needed)

### 1. database (./db)
```
A. docker-compose up (MAKE SURE DOCKER IS RUNNING)
```

### 2. server (./server)
```
A. npm install
B. npm install -g nodemon
C. npm install -g pm2
D. make .env file with the following:

    TOKEN_SECRET = xxx
    COOKIE_PARSER_SECRET = xxx
    BCRYPT_ROUNDS = 13
    DB_HOST=xxx
    DB_USER=xxx
    DB_PWD=xxx
    DB_DB=xxx

E. npm run server (run nodejs)
```

### 3. client (./client)
```
A. npm install
B. npm install -g @vue/cli
C. npm run serve (run vuejs)
```

### REQUIRED INSTALLS
[a Nodejs](https://nodejs.org/en/download/)
[a Git](https://git-scm.com/downloads)
[a Docker][https://docs.docker.com/get-docker/]


### RECOMMENDED
[a VScode](https://code.visualstudio.com/)
[a GitHub](https://desktop.github.com/)

### VSCODE RECOMMENDED INSTALLS
[a VScode (Docker)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
[a VScode (Vetur)](https://marketplace.visualstudio.com/items?itemName=octref.vetur)


### other
```
npm run build (vuejs: Compiles and minifies for production)
npm run lint (vuejs: Lints and fixes files)
npm update OR npm ncu -u (npm: fix vulerabilities)
```

