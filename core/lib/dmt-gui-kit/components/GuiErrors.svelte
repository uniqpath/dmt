<script>
	export let errorStore;
</script>

{#if $errorStore?.errors.length}
	<!-- {JSON.stringify($errorStore.errors)} -->
	<div class="errors">
		{#each $errorStore.errors.slice(0, 3) as error}
			<div class="error" class:cors_problem={error.corsProblem}>
				<div class="header">
					<span class="title">⚠️ Error at <span class="time">{error.time}</span></span>
					<span class="msg">{error.msg}</span>
				</div>

				{#if error.stacktrace}
					{error.stacktrace}
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.errors {
		width: 100%;
		font-size: 0.6rem;
		max-width: 700px;
		padding: 0 10px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.errors .error {
		padding: 15px;
		margin-top: 10px;
		background-color: var(--dmt-dark-red);
		color: white;
		border-radius: 10px;
		color: #bbb;
		word-break: break-word;
	}

	.errors .error.cors_problem {
		background-color: #424de6;
	}

	.error .header {
		/*color: var(--dmt-gray);*/
		margin-bottom: 5px;
	}

	.error .header .title {
		background-color: var(--dmt-dark-gray);
		padding: 2px 4px;
		color: white;
	}

	.error .header .msg {
		color: white;
	}

	.error .header .time {
		/*background-color: var(--dmt-dark-gray);
  padding: 2px 4px;
  color: white;*/
	}
</style>
