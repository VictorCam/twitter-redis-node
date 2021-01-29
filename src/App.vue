<template>
  <div id="main">
  <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#main {
  padding: 30px;
}
 
#main a {
  font-weight: bold;
  color: #2c3e50;
}

#main a.router-link-exact-active {
  color: #42b983;
}
</style>
