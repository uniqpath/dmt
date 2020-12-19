<script>
  import { onMount } from 'svelte';

  export let blogName;

</script>

<div class="links">
  <!-- <a href="#"> -->
    <!-- <img src="/apps/search/img/alien.png" alt="alien" /> -->
  <!-- </a> -->
  <!-- <h3>Motivational corner <span>~ Weekly links from around the web</span></h3> -->

  <div class="link">
    <p>Personal blog:</p>
    <a class="outside" href="/blog"><span>{blogName}</span></a>
  </div>

  <!-- <div class="link">
    <a class="outside" href="https://www.linkedin.com/pulse/my-2020-vision-graduates-how-optimistic-terrible-times-reid-hoffman">How to be Optimistic in Terrible Times</a> by Reid Hoffman <span class="date">May 16 2020</span>
  </div>
 -->
  <!-- <div class="link">
    <a class="outside" href="https://www.rdegges.com/2020/the-feature-snowball">The Feature Snowball</a> by Randall Degges <span class="date">May 03 2020</span>
  </div> -->

<!--   <div class="link">
    <a class="outside" href="https://subcults.com/articles/optimism.html">Ten Good Reasons To Get Out Of Bed In The Morning</a> by <i>RAW</i> <span class="date">some time ago</span>
  </div> -->

</div>

<style>
  .links {
    color: white;

    padding: 10px;
    padding-bottom: 20px;
    /*padding-top: 0;*/
    font-size: 0.8em;
    border-bottom-right-radius: 10px;
    color: #232527;
    background-color: #A4938B;
    background-color: #9EC6EA;
  }

  .links h3 {
    color: #425263;
    margin-top: 5px;
  }

  .links h3 span {
    color: #555;
    font-size: 0.8em;
  }

  .links span.date {
    color: var(--dmt-violet-dark);
    font-size: 0.9em;
  }

  .links .link {
    margin-top: 1px;
  }

  .links .link a.outside {
    text-decoration: underline;
    text-decoration-style: solid;
  }

  .links .link a.outside:before {
    /*content: '➤ ';*/
  }

  /*@media (max-width: 1100px) {
    .links {
      display: none;
    }
  }*/
</style>



