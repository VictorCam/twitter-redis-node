<script>

    // a state for toggling the modal on and off
    let showModal = 'is-active';

    //function
    function modal(e) {
        showModal = (showModal == '') ? 'is-active' : ''
    }

</script>

<!-- a button onclick for sveltekit -->
<!-- <button on:click="{e => modal(e)}">Click me</button> -->

<nav class="navbar has-background-grey-lighter" aria-label="main navigation">
    <div class="navbar-brand is-pulled-left">

        <a role="navigation" class="hamburger navbar-item" href='#toggle'>
            <div class="hamburger-box">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            </div>
        </a>

      <a class="navbar-item" href="https://bulma.io">
        <img src="svelte_build.png" class="logo" alt="logo">
      </a>
    </div>
  
    <div id="navbar" class="navbar-menu">
      <div class="navbar-start">
        <a href='#home' class="navbar-item">
          Home
        </a>
  
        <a href='#documentation' class="navbar-item">
          Details
        </a>
      </div>
  
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a href={'#sign-up'} on:click="{e => modal(e)}" class="button has-background-success has-text-white">
              <strong>Sign up</strong>
            </a>
            <a href={'#log-in'} class="button">
              <strong>Log in</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
</nav>


<section class="hero">
    <div class="hero-body">
        <div class="container has-text-centered">
            <h1 class="title">
                <strong>Fox Box</strong>
            </h1>
            <h2 class="subtitle">
                A new way to create, support, and share content around the world.
            </h2>
        </div>
    </div>
</section>

<!-- signup -->
<section class="section modal {showModal}">
    <div class="modal-background"></div>
    <button class="modal-close is-large" on:click="{e => modal(e)}" aria-label="close"></button>
    <div class="modal-card container column is-two-fifths has-background-light p-5">
        <h1 class="title has-text-centered is-size-4">
            Sign up
        </h1>
        <h2 class="subtitle has-text-centered is-6">
            Please fill in the form below.
        </h2>

        <!-- a divider that is light gray -->

        <div class="is-divider is-grey-light"></div>

        <form action="" method="POST">
            <div class="field">
                <label for="username" class="label medium">Username</label>
                <div class="control">
                    <input class="input is-dark has-background-grey-lighter" type="text" name="username" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <label for="email" class="label">Email</label>
                <div class="control">
                    <input class="input is-dark has-background-black has-background-grey-lighter" type="email" name="email" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <label for="password" class="label">Password</label>
                <div class="control">
                    <input class="input is-dark has-background-grey-lighter" type="password" name="password" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <label for="re-password" class="label">Re-enter Password</label>
                <div class="control">
                    <input class="input is-dark has-background-grey-lighter" type="password" name="password_confirmation" placeholder="Text input">
                </div>
            </div>


            <div class="field m-0 p-0 ">
                <div class="control has-text-centered pt-4 ">
                    <!-- bull width button -->
                    <button disabled={false} class="button has-background-success has-text-white is-medium sign-up is-fullwidth">
                        <strong>Sign up</strong>
                    </button>
                </div>
            </div>
        </form>
    </div>
</section>

<footer class="footer has-background-grey-lighter p-3">
    <div class="content has-text-centered">
      <p>
        <strong>Project Fox Box</strong> by <a href="https://github.com/VictorCam">Victor Campa</a>.
      </p>
    </div>
</footer>

<style>
/* import bulma */
@import 'bulma/css/bulma.css';

/* import divider */
@import 'bulma-extensions/bulma-divider/dist/css/bulma-divider.min.css';

/* import debug file (comment/uncomment) */
/* @import '../debug.css'; */
/* https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51 */

/* footer */
footer {
    position: fixed;
    bottom: 0;
    width: 100%;
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

</style>