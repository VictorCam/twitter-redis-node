# Project-CodeCanine

A work in progress project. Note that Windows users should use WSL2 terminal within VScode and clone the project outside of the <b>mnt</b> directory for a better experience with this project due to slower speeds.</br></br> 

## 1. DATABASE (./db)


<b>Windows WSL:</b> Go to Settings>Resources>WSL Integration>Enable The Distro Installed</br>

A. [install docker](https://github.com/docker/docker-install#dockerdocker-install) </br>
B. docker-compose up

---

## 2. SERVER (./server)
<b>WSL/LINUX:</b> [install nvm nodejs](https://github.com/nvm-sh/nvm#installing-and-updating)</br>
<b>MAC:</b> [install nodejs](https://nodejs.org/en/download/)</br>

A. [install aerospike prerequisites](https://github.com/aerospike/aerospike-client-nodejs#Prerequisites)</br>
B. npm install</br>
C. npm install -g nodemon</br>
D. npm install -g pm2</br>
E. make .env file with the following:

    TOKEN_SECRET = xxx
    COOKIE_PARSER_SECRET = xxx
    BCRYPT_ROUNDS = 13

F. nodemon (run nodejs server)</br>

---

## 3. CLIENT (./client)
A. npm install</br>
B. npm install -g @vue/cli</br>
C. npm run serve (run vuejs)</br>

---

## ALL REQUIRED INSTALLS
[Git](https://git-scm.com/downloads)</br>
[Docker](https://docs.docker.com/get-docker/)</br>
[VScode](https://code.visualstudio.com/)</br>
[VScode (Vetur)](https://marketplace.visualstudio.com/items?itemName=octref.vetur)</br>
[Vscode (WSL)](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)</br>
[VScode (Docker)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)</br>

---

## OTHER
(vuejs: Compiles and minifies for production)
```
npm run build
```
(vuejs: Lints and fixes files)
```
npm run lint
```
(npm: update packages)
```
npm install -g npm-check-updates
npm ncu -u
npm update
```


