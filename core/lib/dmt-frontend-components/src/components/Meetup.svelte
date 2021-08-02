<script>
  import { fade, fly } from 'svelte/transition';

  import weblocaltime from 'weblocaltime';

  import { applyCss } from 'dmt-frontend-helpers';

  export let state, padding, bg, profileEmoji;

  export let meetupClickHandler = () => {};
  export let timezoneClickHandler = () => {};

  export let lang = 'en';

  let t_todays_meetup = lang != 'sl' ? "Today's meetup" : "Današnje srečanje"; // rename to "Next"
  let t_meetup = lang != 'sl' ? "Meetup" : "Spletno srečanje";
  let t_link_will_be_visible = lang != 'sl' ? "You can join via this website." : "Povezava bo vidna tukaj — ste na pravem mestu.";
  let t_starting = lang != 'sl' ? "… starting …" : "… se začenja …";
  let t_about_to_begin = lang != 'sl' ? "… about to begin soon …" : "… se bo kmalu začelo …";
  let t_join = lang != 'sl' ? "Join the Meetup" : "Pridruži se";
  let t_try_join = lang != 'sl' ? "You can still try to join" : "Lahko se poskusite pridružiti";
  let t_now = lang != 'sl' ? "Now" : "zdaj";
  let t_live = lang != 'sl' ? "Event is live" : "V teku";
  let t_just_ended = lang != 'sl' ? "Meetup has probably already concluded but" : "Dogodek se morda že zaključuje";
  let t_today = lang != 'sl' ? "Today" : "Danes";
  let t_tomorrow = lang != 'sl' ? "Tomorrow" : "Jutri";

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
  let meetupTitle
  let meetupPassword
  //let nextMeetupIn
  let eventProbablyEnded
  let startsAt
  let isToday
  let isTomorrow
  let longTimeUntilStart

  state.subscribe(({meetup}) => {
    if(meetup) {
      startsAtUnixTimestamp = meetup.startsAtUnixTimestamp;
      startsIn = meetup.startsIn;
      startsSoon = meetup.startsSoon;
      aboutToStart = meetup.aboutToStart;
      startedAgo = meetup.startedAgo;
      meetupStatus = meetup.meetupStatus;
      meetupUrl = meetup.meetupUrl;
      meetupTitle = meetup.meetupTitle;
      meetupPassword = meetup.meetupPassword;
      isToday = meetup.isToday;
      isTomorrow = meetup.isTomorrow;
      longTimeUntilStart = meetup.longTimeUntilStart;
      //nextMeetupIn = meetup.nextMeetupIn;
      eventProbablyEnded = meetup.eventProbablyEnded;
      startsAt = startsAtUnixTimestamp ? new Date(startsAtUnixTimestamp) : undefined;
    }
  })

  let displayUTC = false;

  $: startsAtLocalized = startsAt ? weblocaltime(startsAt, { showYear: false, utc: displayUTC }) : {};

  function toggleUTC() {
    displayUTC = !displayUTC;
    timezoneClickHandler(`display UTC: ${displayUTC}`);
    // displayTimezone = displayUTC ? 'UTC' : undefined;
  }
</script>

{#if meetupUrl || startsIn}

  <!-- <section class="meetup" use:applyCss={meetupCss} class:live={meetupUrl} class:probably_ended={eventProbablyEnded} class:starts_soon={startsSoon} in:fly={{duration: 1500, delay: 0 }} out:fly> -->

    <section class="meetup" use:applyCss={meetupCss} class:live={meetupUrl} class:probably_ended={eventProbablyEnded} class:starts_soon={startsSoon}>

    <h2 class="next_meetup" class:starts_soon={startsSoon}><span class="white">—</span>

      {#if startsSoon || meetupUrl}
        {t_todays_meetup}
      {:else}
        {t_meetup}
      {/if}

      <span class="white">—</span>
    </h2>

    {#if meetupTitle && !eventProbablyEnded}
      <h4 class="meetup_title">[ {meetupTitle} ]</h4>
    {/if}

    <div id="event">
      {#if meetupUrl}
        <div class="starts_at">
          {#if startsIn}
            {#if aboutToStart}
              <span class="fade_in_and_out">{t_starting}</span>
            {:else}
              <span class="fade_in_and_out">{t_about_to_begin}</span>
            {/if}

          {:else}
            {#if eventProbablyEnded}
              ⌛ {t_just_ended}
            {:else}
              <span class="fade_in_and_out">✨ {t_live} ✨</span>
            {/if}
          {/if}

          <br>

          <a class="meetup_url" href="{meetupUrl}" on:click={meetupClickHandler} class:fully_started={aboutToStart || !startsIn}>
            —

            {#if eventProbablyEnded}
              {profileEmoji || ''} {t_try_join}
            {:else}
              {profileEmoji || ''} {t_join}
            {/if}

            —
          </a>

          <br>

          {#if meetupPassword}
            Password: <span class="event_password">{meetupPassword}</span>
          {/if}
        </div>
      {:else}
        <div class="starts_at">
          <!-- <span class="event_time" transition:fade> -->
          <span class="event_time">

            {#if lang == 'sl'}

              <span class:deemph={isToday || isTomorrow}>
                {startsAtLocalized.parts.weekday.replace('Monday', 'Ponedeljek').replace('Tuesday', 'Torek').replace('Wednesday', 'Sreda').replace('Thursday', 'Četrtek').replace('Friday', 'Petek').replace('Saturday', 'Sobota').replace('Sunday', 'Nedelja')}
              </span>

              <span class='deemph'>{startsAtLocalized.parts.day}.{startsAtLocalized.parts.monthNumeric}.{startsAtLocalized.parts.year}</span>

              {#if isToday}
                <span class='deemph'>·</span>
                <span class:deemph_day={!isToday}>{t_today}</span>
              {:else if isTomorrow}
                <span class='deemph'>·</span>
                <span class:deemph_day={!isTomorrow}>{t_tomorrow}</span>
              {/if}

              <span class='deemph'>ob</span> {startsAtLocalized.parts.time24}

            {:else}
              {startsAtLocalized.emoji}

              <span class:deemph={isToday || isTomorrow}>{startsAtLocalized.date} {startsAtLocalized.parts.year}</span>

              {#if isToday}
                <span class='deemph'>·</span>
                <span class:deemph_day={!isToday}>{t_today}</span>
              {:else if isTomorrow}
                <span class='deemph'>·</span>
                <span class:deemph_day={!isTomorrow}>{t_tomorrow}</span>
              {/if}

              <span class='deemph'>at</span> {startsAtLocalized.time} <span class='deemph'>{startsAtLocalized.timeClarification}</span>
            {/if}

          </span>
        </div>

        <div class="timezone">
          {startsAtLocalized.timezone} → <a href="#" on:click|preventDefault|stopPropagation={() => toggleUTC()}>{displayUTC ? 'My timezone' : 'UTC'}</a>
        </div>

      {/if}
    </div>

    {#if startsSoon}
      {#if aboutToStart}✨{:else if meetupUrl}⏳{:else}⏱️{/if}
    {/if}

    {#if meetupStatus}
      <span class="meetup_status line" class:in_progress={!!meetupUrl} class:starts_soon={startsSoon}>
        {meetupStatus}
      </span>
    {/if}

    <!-- {#if startsIn && !aboutToStart && !meetupUrl && !startsSoon} -->
    {#if startsIn && !meetupUrl && !longTimeUntilStart}
      <span class="lightgray line">{t_link_will_be_visible}</span>
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

  #event a.meetup_url {
    text-decoration: none;
    margin-top: 10px;
    display: inline-block;
    padding: 3px 7px;
    border-radius: 20px;

    color: var(--dmt-green);
    border: 1px solid var(--dmt-green);
  }

  #event a.meetup_url.fully_started {
    color: white;
    border: 1px solid white;
  }

  #event a.meetup_url:hover {
    background-color: var(--dmt-navy);
  }

  .meetup_title {
    color: var(--dmt-warm-pink);
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

  section.meetup.starts_soon #event {
    /*background: rgb(152,106,235);
    background: linear-gradient(180deg, rgba(152,106,235,1) 0%, rgba(126,82,204,1) 100%);*/
    /*background: rgb(0,255,189);
    background: linear-gradient(0deg, rgba(0,255,189,1) 0%, rgba(5,208,155,1) 24%, rgba(0,255,189,1) 96%);*/
    background: rgb(0,255,189);
    background: linear-gradient(0deg, rgba(0,255,189,1) 0%, rgba(5,208,155,1) 24%, rgba(3,175,130,1) 96%);
    /*background-color: red;*/
  }

  section.meetup.live #event {
    background: rgb(68,108,161);
    background: linear-gradient(180deg, rgba(52,86,131,1) 100%, rgba(68,108,161,1) 0%);
    /*background: rgb(41,179,191);
    background: linear-gradient(0deg, rgba(41,179,191,1) 0%, rgba(33,156,167,1) 24%, rgba(24,130,139,1) 96%);*/
    /*background: rgb(238,191,201);
    background: linear-gradient(0deg, rgba(238,191,201,1) 0%, rgba(236,205,212,1) 32%, rgba(231,201,207,1) 56%);*/
  }

  section.meetup.live.probably_ended #event {
    background: rgb(65,70,143);
    background: linear-gradient(180deg, rgba(65,70,143,1) 0%, rgba(53,58,124,1) 100%);
  }

  section.meetup.live.probably_ended #event .starts_at {
    color: #ccc;
  }

  #event .starts_at {
    padding-top: 15px;
    color: white;
    color: var(--dmt-light-violet);
    color: var(--dmt-green);

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
    color: #333;
  }

  #event .timezone a:hover {
    color: black;
  }

  #event .timezone a.weblocaltime_source {
    font-size: 0.7em;
    color: #333;
  }

  .next_meetup {
    color: var(--dmt-light-magenta);
  }

  .fade_in_and_out {
    animation: 1500ms linear changeOpacity;
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

  .deemph_day {
    color: #555;
    font-weight: normal;
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

  .meetup_status {
    color: var(--dmt-light-magenta);
  }

  .meetup_status.in_progress {
    color: var(--dmt-light-gray);
  }

  h2.starts_soon, .meetup_status.starts_soon {
    color: var(--dmt-green);
  }
</style>
