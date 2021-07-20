# Project-CodeCanine

## Project Setup (use sudo when needed)

### 1. DATABASE (./db)
```
A. docker-compose up (MAKE SURE DOCKER IS RUNNING)
```

### 2. SERVER (./server)
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

### 3. CLIENT (./client)
```
A. npm install
B. npm install -g @vue/cli
C. npm run serve (run vuejs)
```

### REQUIRED INSTALLS
[Nodejs](https://nodejs.org/en/download/)</br>
[Git](https://git-scm.com/downloads)</br>
[Docker](https://docs.docker.com/get-docker/)</br>


### RECOMMENDED
[VScode](https://code.visualstudio.com/)</br>
[VScode (Docker)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)</br>
[VScode (Vetur)](https://marketplace.visualstudio.com/items?itemName=octref.vetur)</br>
[GitHub Desktop](https://desktop.github.com/)</br>



### OTHER
```
npm run build (vuejs: Compiles and minifies for production)
npm run lint (vuejs: Lints and fixes files)
npm update OR npm ncu -u (npm: fix vulerabilities)
```

