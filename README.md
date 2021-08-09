# Project-CodeCanine

## Project Setup (use sudo when needed)

### 1. DATABASE (./db)
```
A. docker-compose up (MAKE SURE DOCKER IS RUNNING)
```

### 2. SERVER (./server) WIP
```
1. apt update || apt install apt-file -y || apt-file update
2. apt install vim curl wget git unzip -y
3. curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
5. . .bashrc


A. npmjs.com/package/aerospike (follow requirements)
B. npm install
1. npm install -g node-gyp
C. npm install -g nodemon
D. npm install -g pm2
E. npm install -g npm-check-updates
F. make .env file with the following:

    TOKEN_SECRET = xxx
    COOKIE_PARSER_SECRET = xxx
    BCRYPT_ROUNDS = 13

G. nodemon (run nodejs)
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
[VScode](https://code.visualstudio.com/)</br>
[VScode (Vetur)](https://marketplace.visualstudio.com/items?itemName=octref.vetur)</br>

### RECOMMENDED
[VScode (Docker)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)</br>
[GitHub Desktop](https://desktop.github.com/)</br>


### OTHER
```
npm run build (vuejs: Compiles and minifies for production)
npm run lint (vuejs: Lints and fixes files)
npm update OR ncu -u (npm: update packages)
```

