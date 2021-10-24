
<style scoped>
    .nav-item {
      text-decoration: none;
      color: rgb(151, 180, 233);
    }
    .brand {
      color: rgb(236, 236, 236);
      text-decoration: none;
      background-color: transparent;
      display: inline-block;
      padding-top: .3125rem;
      padding-bottom: .3125rem;
      margin-right: 1rem;
      font-size: 1.25rem;
      line-height: inherit;
      white-space: nowrap;
    }
    .nav {
      padding-top: .75em;
      padding-bottom: .75em;
      color: #333;
      border-radius: 0;
      box-shadow: none;
      border: none;
      margin-bottom: 0;
      position: sticky;
      top: 0px;
      z-index: 1020;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: .1rem 1rem;
      background-color: rgb(45,45,45);
    }
    .container {
      padding-right: 0;
      padding-left: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-right: auto;
      margin-left: auto;
      box-sizing: border-box;
    }
    #main a.a-exact-active {
      color: #42b983;
    }
    </style>

<nav class="nav">
    <div class="container">
      <a href="/" class="brand">Project CodeCanine</a>
      <a class="nav-item" href="/">Test</a> |
      <a class="nav-item" href="/about">About</a> |
      <a class="nav-item" href="/posts">Posts</a> |
      <a class="nav-item" href="/login">Login</a> |
      <a class="nav-item" href="/Signup">Sign Up</a> |
      <a class="nav-item" href="/upload">Upload</a> |
    <!-- <a class="nav-item" :to="`/profile/${user}`" >Profile</a> -->
      <button>LOGOUT</button>
    </div>
  </nav>