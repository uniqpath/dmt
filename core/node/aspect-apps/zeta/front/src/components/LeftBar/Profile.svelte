<script>
  import { onMount } from 'svelte';

  export let connected;
  export let loginStore;
  export let store;

  // load at start
  $: ethAddress = $loginStore.ethAddress;

  $: savedName = $loginStore.userName || $loginStore.userIdentity;
  $: savedEmail = $loginStore.userEmail;

  // not reactive!
  // let name;
  // let email;

  let editMode;

  function edit(_editMode = true) {
    editMode = _editMode;

    document.getElementById('name').value = savedName || '';
    document.getElementById('email').value = savedEmail || '';

    // if (editMode) {
    //   setTimeout(() => {

    //   }, 10);
    // }
  }

  function save() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    store.saveUserProfile({ ethAddress, userName: name, userEmail: email });

    editMode = false;
  }

</script>

<div class="profile">
  <!-- <a href="#"> -->
    <!-- <img src="/apps/zeta/img/alien.png" alt="alien" /> -->
  <!-- </a> -->

  <h3>Profile</h3>

  <div class="edit_form" class:visible={editMode}>

    <label for="name">Your nick or real name</label>
    <input id="name" placeholder="" disabled={!connected}>

    <label for="email">Your email</label>
    <input id="email" placeholder="" disabled={!connected}>

    <p>
      {#if connected}
        <a href="#" on:click|preventDefault={() => { save(); }}>Save</a>
      {:else}
        Disconnected
      {/if}
      | <a href="#" on:click|preventDefault={() => { edit(false); }}>Cancel</a>
    </p>

  </div>

  <div class="display_profile" class:visible={!editMode}>

    <p>
      <span>Name:</span> {savedName || '/'}
    </p>

    <p>
      <span>Email:</span> {savedEmail || '/'}
    </p>

    <a href="#" on:click|preventDefault={() => { edit(); }}>Edit profile</a>

  </div>

  {#if !savedEmail}
    <div class="explain">Provide email if you want to be notified about project progress.</div>
  {/if}

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
    color: #232527;
    background-color: #8EEFA2;
    background-color: var(--dmt-warning-pink);

    width: 400px;

    text-align: justify;
  }

  .profile input {
    width: 250px;
  }

  .profile input:disabled {
    background-color: var(--dmt-warning-pink);
  }

  .profile span {
    color: var(--dmt-violet-dark);
  }

  .profile h3 {
    color: var(--dmt-navy);
    margin-top: 5px;
  }

  .profile h3 span {
    color: #555;
  }

  .profile .section_header {
    font-weight: bold;
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
