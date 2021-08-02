<script>
  import { fade, fly } from 'svelte/transition';

  import weblocaltime from 'weblocaltime';

  import { applyCss } from 'dmt-frontend-helpers';

  export let backend, padding, bg;
  export let clickStat = () => {};

  export let lang = 'en';

  let t_next = lang != 'si' ? "Next" : "Uvodno"; // rename to "Next"
  let t_meetup = lang != 'si' ? "Meetup" : "srečanje";
  let t_you_can_join = lang != 'si' ? "You can join via this website." : "Povezava bo vidna tukaj malo pred srečanjem.";

  // ⚠️ ISSUE
  // if connection is down, then stale state will be shown on frontend!
  // for example: event that is not there anymore
  // not sure how to remedy... perhaps implement on frontend
  // lastUpdateReceived at? and then don't show if too far back
  // yes that's the solution, frontend has to know to remove stale event
  // sometimes there are also bugs in browsers and websockets don't work!

  const meetupCss = { padding };

  if(bg) {
    Object.assign(meetupCss, {
      'background-image': `url('${bg}')`,
      'background-size': 'cover',
      'background-repeat': 'no-repeat'
    })
  }

  let startsAtUnixTimestamp
  let startsIn
  let startsSoon
  let aboutToStart
  let startedAgo
  let meetupStatus
  let meetupUrl
  let meetupPassword
  //let nextMeetupIn
  let eventProbablyEnded
  let startsAt

  backend.subscribe(({meetup}) => {
    if(meetup) {
      startsAtUnixTimestamp = meetup.startsAtUnixTimestamp;
      startsIn = meetup.startsIn;
      startsSoon = meetup.startsSoon;
      aboutToStart = meetup.aboutToStart;
      startedAgo = meetup.startedAgo;
      meetupStatus = meetup.meetupStatus;
      meetupUrl = meetup.meetupUrl;
      meetupPassword = meetup.meetupPassword;
      //nextMeetupIn = meetup.nextMeetupIn;
      eventProbablyEnded = meetup.eventProbablyEnded;
      startsAt = startsAtUnixTimestamp ? new Date(startsAtUnixTimestamp) : undefined;
    }
  })

  let displayUTC = false;

  $: startsAtParts = startsAt ? weblocaltime(startsAt, { showYear: false, utc: displayUTC }) : {};

  function switchBetweenUTC() {
    displayUTC = !displayUTC;
    clickStat(`display UTC: ${displayUTC}`);
    // displayTimezone = displayUTC ? 'UTC' : undefined;
  }
</script>

{#if meetupUrl || startsIn}

  <section class="meetup" use:applyCss={meetupCss} class:live={meetupUrl} class:probably_ended={eventProbablyEnded} class:starts_soon={startsSoon} in:fly={{duration: 1500, delay: 0 }} out:fly>

    <h2 class="next_meetup"><span class="white">
    —</span>

    {#if startsSoon || meetupUrl}
      {#if startsIn}
        Current
      {:else if eventProbablyEnded}
        Recent
      {:else}
        Live
      {/if}
    {:else}
      {t_next}
    {/if}
    {t_meetup} <span class="white">—</span>
    </h2>

    <div id="event">
      {#if meetupUrl}
        <div class="starts_at">
          {#if startsIn}
            {#if aboutToStart}
              <span class="fade_in_and_out">Starting …</span>
            {:else}
              <span class="fade_in_and_out">About to begin soon …</span>
            {/if}

          {:else}
            {#if eventProbablyEnded}
              ⌛ Meetup has probably just concluded but
            {:else}
              <span class="fade_in_and_out">✨ Event is live ✨</span>
            {/if}
          {/if}

          <br>

          {#if eventProbablyEnded}
            <a href="{meetupUrl}">— You can still try to join —</a>
          {:else}
            <a href="{meetupUrl}">— Join the Meetup {#if startsSoon && !aboutToStart}Room{:else}Now{/if} —</a>
          {/if}

          <br>

          {#if meetupPassword}
            Password: <span class="event_password">{meetupPassword}</span>
          {/if}
        </div>
      {:else}
        <div class="starts_at">
          <span class="event_time" transition:fade>
          {startsAtParts.emoji} {startsAtParts.date} <span class='deemph'>at</span> {startsAtParts.time} <span class='deemph'>{startsAtParts.timeClarification}</span>
          </span>
        </div>

        <div class="timezone">
          {startsAtParts.timezone} → <a href="#" on:click|preventDefault={() => switchBetweenUTC()}>{displayUTC ? 'My timezone' : 'UTC'}</a>
        </div>

      {/if}
    </div>

    {#if startsIn}
      {#if startsSoon}
        {#if aboutToStart}⚠️{:else if meetupUrl}⏳{:else}⏱️{/if}
      {/if}

      <span class="light_magenta line">{meetupStatus}</span>

      {#if !aboutToStart && !meetupUrl && !startsSoon}
        <span class="lightgray line">{t_you_can_join}</span>
      {/if}

    {:else if !eventProbablyEnded}
      <!-- <span class="light_magenta line">Next meetup is in {nextMeetupIn}.</span>
    {:else} -->
      <span class="light_violet line">{meetupStatus}</span>
      <span class="light_magenta line">Let's chat about web3 search and discovery!</span>
      <!-- <span class="light_magenta line">Welcome to provide ideas or just listen.</span> -->
    {/if}

  </section>

{/if}


<style>
  #event {
    margin: 0 auto;
    max-width: 500px;
    width: 95%;
    height: 70px;
    position: relative;
    margin-bottom: 20px;
    border-radius: 10px;

    /*background-color: var(--dmt-light-magenta);*/
    background: rgb(154,169,239);
    background: linear-gradient(180deg, rgba(154,169,239,1) 0%, rgba(145,157,212,1) 100%);
  }

  #event a {
    color: white;
    text-decoration: underline;
  }

  #event .starts_at a:hover {
    color: var(--dmt-light-violet);
  }

  section {
    border-radius: 20px;
    font-size: 0.8rem; /*to compensate dmt system -- same is defined in dmt-system website in main element*/

    border-radius: 20px;
    width: 100%;
    /*opacity: 0.9;*/
    color: #777;
    text-align: center;
    /*padding: 20px;*/
    box-sizing: border-box;
  }

  section.meetup.live #event {
    background: rgb(68,108,161);
    background: linear-gradient(180deg, rgba(52,86,131,1) 100%, rgba(68,108,161,1) 0%);
  }

  section.meetup.live.probably_ended #event {
    background: rgb(65,70,143);
    background: linear-gradient(180deg, rgba(65,70,143,1) 0%, rgba(53,58,124,1) 100%);
  }

  section.meetup.live.starts_soon #event {
    background: rgb(152,106,235);
    background: linear-gradient(180deg, rgba(152,106,235,1) 0%, rgba(126,82,204,1) 100%);
  }

  section.meetup.live.probably_ended #event .starts_at {
    color: #ccc;
  }

  #event .starts_at {
    padding-top: 15px;
    color: white;
    color: var(--dmt-light-violet);

    font-size: 1.2em;
    text-align: center;
  }

  section.meetup.live #event .starts_at {
    padding-top: 5px;
  }

  #event .starts_at .invisible {
    display: none;
  }

  #event .starts_at .event_password {
    font-size: 0.7em;
    color: #BBB;
  }

  #event .timezone {
    padding-top: 4px;
    color: white;
    color: #333;
  }

  #event .timezone a {
    color: white;
  }

  #event .timezone a.weblocaltime_source {
    font-size: 0.7em;
    color: #333;
  }

  .next_meetup {
    color: var(--dmt-light-magenta);
  }

  .fade_in_and_out {
    animation: 2000ms linear changeOpacity;
    animation-iteration-count: infinite;
  }

  @keyframes changeOpacity {
    /* You could think of as "step 1" */
    0% {
      opacity: 0.4;
    }
    10% {
      opacity: 0.5;
    }
    20% {
      opacity: 0.6;
    }
    30% {
      opacity: 0.7;
    }
    40% {
      opacity: 0.8;
    }
    50% {
      opacity: 1.0;
    }
    60% {
      opacity: 1.0;
    }
    70% {
      opacity: 0.8;
    }
    80% {
      opacity: 0.7;
    }
    90% {
      opacity: 0.6;
    }
    100% {
      opacity: 0.4;
    }
  }

  span.event_time {
    color: var(--dmt-light-magenta);
    color: #333;
    font-weight: bold;
  }

  span.event_time span.deemph {
    color: #555;
    font-size: 0.8em;
  }

  section.starts_at {
    color: #222;
    /*background-color: #31e5c1; previous green! perhaps unify*/
    background-color: #32e6be;
    padding: 20px 50px;
    text-align: justify;
    font-size: 0.9em;
  }

  /*COLORS*/

  span.white {
    color: white;
  }

  span.gray {
    color: #777;
  }

  span.lightgray {
    color: #BBB;
  }

  span.cyan {
    /*CHECK*/
    /*color: var(--dmt-cyan);*/
    color: var(--dmt-system-cyan);
  }

  span.violet {
    color: var(--dmt-violet);
  }

  span.light_violet {
    color: var(--dmt-light-violet);
  }

  span.light_magenta {
    color: var(--dmt-light-magenta);
  }
</style>
