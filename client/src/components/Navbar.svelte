<script>
    //function for displaying modal
    import { modal } from '../stores/store_root'
    import cookies from 'js-cookie'
</script>

<section>
<nav class="navbar has-background-grey-lighter" aria-label="main navigation">
    <div class="navbar-brand is-pulled-left">

      <!-- missing the hamburger class in navigation a link -->
        <a role="navigation" class="hamburger navbar-item" href={''}> 
            <div class="hamburger-box">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            </div>
        </a>

      <a class="navbar-item" href="https://bulma.io">
        <i class="fa-solid fa-box icon fa-3x"></i>
      </a>
    </div>
  
    <!--  -->
    <div id="navbar" class="navbar-menu">
      <div class="navbar-start">
        <a href={''} class="navbar-item">
          Home
        </a>
        <a href='#documentation' class="navbar-item">
          Details
        </a>
      </div>
    </div>

    <!-- signup / login -->
    <div class="navbar-end">
      {#if cookies.get('test')}
        <div class="navbar-item">
          <a href={''} on:click="{e => modal(e)}" class="button has-background-success has-text-white">
            <strong>Sign up</strong>
          </a>
          <a href={''} class="button">
            <strong>Log in</strong>
          </a>
        </div>
      {/if}
    <div>
</nav>
</section>

<style>
/* @import '../debug.css'; */

.navbar-end {
  display: flex;
}

.navbar-item {
  margin-left: auto;
}

  /* hamburger */
.hamburger-box {
    display: flex;
    width: 100%;
    height: 100%;
}

.hamburger {
    transform: rotate(90deg);
}

.hamburger span {
    padding: 2px;
    border-radius: 5px;
    background-color: #000000;
    margin: 3px;
}

/* banner */
.icon {
    color: #cbc67f;
}
</style>