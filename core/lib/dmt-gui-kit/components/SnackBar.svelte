<script>import { fly } from "svelte/transition";
import { snackbar } from "../store/snack";
import XIcon from "../icons/XIcon.svelte";
import { browser } from "../environment";
let klass = "";
export { klass as class };
let upSmallScreen = false;
$:
  sm = browser && upSmallScreen ? innerWidth <= 768 : false;
</script>

{#key $snackbar}
	<div
		in:fly={{ delay: 10, y: sm ? -48 : 48, duration: 500 }}
		out:fly={{ delay: 10, y: sm ? -48 : 48, duration: 500 }}
		id="snackbar"
		class:show={$snackbar}
		class="snackbar"
	>
		<div class="message">
			<span class:danger={$snackbar?.color === 'danger'} class={klass}>{$snackbar?.message}</span>
			<button on:click={snackbar.close}><XIcon size="17" /></button>
		</div>
	</div>
{/key}

<style>
	.snackbar {
		display: none;
		background-color: transparent;
		color: transparent;
		text-align: start;
		position: fixed;
		z-index: 9999;
		width: 100%;
		max-width: 60vw;
		padding-left: 2.5rem;
		/* left: 50%; */
		bottom: 2rem;
		-webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
		animation: fadein 0.5s, fadeout 0.5s 2.5s;
		font-size: 17px;
	}

	.message {
		background-color: #333;
		color: #fff;
		border-radius: 2px;
		padding: 1rem;
		align-items: flex-start;
		display: flex !important;
		gap: 20px;
		justify-content: space-between;
	}

	.show {
		display: flex !important;
	}

	.danger {
		color: var(--dmt-red);
	}
	button {
		display: grid;
		place-items: center;
		padding: 0;
		margin: 0;
		color: #fff;
		background: transparent;
		border: transparent;
		cursor: pointer;
	}
	button:active {
		transform: scale(0.75);
	}
</style>
