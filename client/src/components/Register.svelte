<script>
    import { sum_toggle, modal, signup } from '../stores/store_root'
</script>

<section class="section modal {$sum_toggle}">
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

        <form on:submit|preventDefault={signup}>
            <div class="field">
                <i class="fa-solid fa-user form-icon"></i>
                <label for="username" class="label medium">Username</label>
                <div class="control">
                    <input class="input is-dark has-background-grey-lighter" type="text" name="username" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <i class="fa-solid fa-envelope form-icon"></i>
                <label for="email" class="label">Email</label>
                <div class="control">
                    <input class="input is-dark has-background-black has-background-grey-lighter" type="email" name="email" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <i class="fa-solid fa-key form-icon"></i>
                <label for="password" class="label">Password</label>
                <div class="control">
                    <input class="input is-dark has-background-grey-lighter" type="password" name="password" placeholder="Text input">
                </div>
            </div>
            <div class="field">
                <i class="fa-solid fa-key form-icon"></i>
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

<style>
    @import 'bulma/css/bulma.css';
    
    /* form */
    .label {
        display: inline-block;
    }
</style>