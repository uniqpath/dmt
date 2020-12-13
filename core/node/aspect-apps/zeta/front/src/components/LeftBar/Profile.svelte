<script>
  import { onMount } from 'svelte';

  export let connected;
  export let loginStore;
  export let backend;
  export let isAdmin;

  // load at start
  $: ethAddress = $loginStore.ethAddress;

  $: savedName = $loginStore.userName || $loginStore.userIdentity;
  //$: savedEmail = $loginStore.userEmail;
  $: savedTagline = $loginStore.userTagline;

  // not reactive!
  // let name;
  // let email;

  const missing = "?";

  let editMode;

  function edit(_editMode = true) {
    editMode = _editMode;

    document.getElementById('name').value = savedName || '';
    // document.getElementById('email').value = savedEmail || '';

    // if (editMode) {
    //   setTimeout(() => {
    //   }, 10);
    // }
  }

  function save() {
    const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    //store.saveUserProfile({ ethAddress, userName: name, userEmail: email });
    backend.saveUserProfile({ ethAddress, userName: name });

    editMode = false;
  }

  let minimized;

  function minimize() {
    minimized = true;
  }

</script>



<div class="profile" class:visible={!minimized}>


  <!-- <a href="#"> -->
    <!-- <img src="/apps/zeta/img/alien.png" alt="alien" /> -->
  <!-- </a> -->

  <!-- <a href="#" class="minimize" on:click={() => minimize()}>X</a> -->

  <!-- {#if !isAdmin}
    Cannot edit profile because not Admin.
  {:else} -->

    <h3>Myself
      {#if editMode}
        · <a class="save" href="#" on:click|preventDefault={() => { save(); }}>Save</a>
      {/if}

      ·

      {#if editMode}
        <a class="cancel" href="#" on:click|preventDefault={() => { edit(false); }}>Cancel</a>
      {:else}
        <a href="#" on:click|preventDefault={() => { edit(); }}>EDIT</a>
      {/if}

    </h3>

    <div class="edit_form" class:visible={editMode}>

      <label for="name">First name</label>
      <input id="name" placeholder="" disabled={!connected}>

      <!-- <label for="email">Your email</label>
      <input id="email" placeholder="" disabled={!connected}> -->

      <!-- <label for="tagline">Tagline</label>
      <input id="tagline" placeholder="" disabled={!connected}> -->

      <!-- <p>
        {#if connected}
          <a href="#" on:click|preventDefault={() => { save(); }}>Save</a>
        {:else}
          Disconnected
        {/if}
        | <a href="#" on:click|preventDefault={() => { edit(false); }}>Cancel</a>
      </p> -->

    </div>

    <div class="display_profile" class:visible={!editMode}>

      <p>
        <span>First name:</span> {savedName || missing}
      </p>

      <!-- <p>
        <span>Email:</span> {savedEmail || '/'}
      </p> -->

      <!-- <p>
        <span>Tagline:</span> {savedTagline || missing}
      </p> -->

    </div>

  <!-- {/if} -->

</div>

<style>
  .profile {
    color: white;

    margin-top: 10px;

    padding: 10px;
    /*padding-top: 0;*/
    font-size: 0.8em;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    /*color: #232527;*/
    background-color: #8EEFA2;
    /*background-color: var(--dmt-warning-pink);*/
    background-color: var(--dmt-navy);

    width: 250px;

    text-align: justify;

    display: none;
  }

  .profile.visible {
    display: block;
  }

  .profile a {
    color: white;
  }

  .profile a.minimize {
    float: right;
    font-weight: bold;
    text-decoration-style: dotted
  }

  .profile a.save {
    background-color: var(--zeta-green);
    color: #333;
    padding: 1px 3px;
    border-radius: 4px;
  }

  .profile a.save:hover {
    background-color: var(--zeta-green-highlight);
  }

  .profile a.cancel {
    font-size: 0.8em;
  }

  .profile input {
    width: 250px;
  }

  .profile input:disabled {
    background-color: var(--dmt-warning-pink);
  }

  .profile span {
    /*color: var(--dmt-violet-dark);*/
    color: var(--zeta-green);
  }

  .profile h3 {
    /*color: var(--dmt-navy);*/
    margin-top: 5px;
    color: var(--zeta-green);
  }

  .profile h3 span {
    /*color: #555;*/
    /*color: #ddd;*/
    color: var(--dmt-cyan);
  }

  .profile .section_header {
    font-weight: bold;
  }

  .profile .edit_form label {
    margin-bottom: 2px;
  }

  .edit_form, .display_profile {
    display: none;
  }

  .edit_form.visible, .display_profile.visible {
    display: block;
  }

  .explain {
    margin-top: 10px;
    /*color: #ddd;*/
    font-size: 0.8em;
  }

  .explain span {
    /*color: var(--dmt-bright-cyan);*/
    color: var(--dmt-cool-green);
  }

  section {
    display: none;
  }

  span.mark:before {
    content: '▷';
  }

  span.section_visible.mark:before {
    content: '▼';
  }

  section.visible {
    display: block;
  }
</style>
