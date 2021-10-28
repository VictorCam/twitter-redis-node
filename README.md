# Project-CodeCanine

A woof in progress project. 

## 1. DOCKER (./docker)

A. [install docker](https://docs.docker.com/get-docker/) </br>
B. docker-compose up

---

## 2. SERVER (./server)

A. [install nodejs](https://nodejs.org/en/download/) </br>
B. npm install</br>
C. npm install -g nodemon</br>
D. make .env file with the following:

    TOKEN_SECRET = xxx
    COOKIE_PARSER_SECRET = xxx
    BCRYPT_ROUNDS = 13
    CLIENT_API = http://localhost:3000

E. nodemon (run nodejs server)</br>

---

## 3. CLIENT (./client)
A. npm install</br>
B. make .env file with the following:

    VITE_SERVER="http://localhost:13377"
    
C. npm run dev (run sveltekit)</br>


---

## ALL HELPFUL/IMPORTANT INSTALLS
[Git](https://git-scm.com/downloads)</br>
[Docker](https://docs.docker.com/get-docker/)</br>
[VScode](https://code.visualstudio.com/)</br>
[VScode (Svelte)](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)</br>
[VScode (Docker)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)</br>
[Postman](https://www.postman.com/downloads/)</br>
[AnotherRedisDesktopManager](https://github.com/qishibo/AnotherRedisDesktopManager)</br>

---

## OTHER
npm: update packages
```
npm install -g npm-check-updates
npm ncu -u
npm update
```


