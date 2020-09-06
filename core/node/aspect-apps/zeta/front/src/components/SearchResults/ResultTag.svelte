<script>
  import { mediaTypeIcon } from 'dmt-js';

  export let tag;
</script>

<span class="tag {tag.toLowerCase()}Tag">

  {#if mediaTypeIcon(tag)}
    {mediaTypeIcon(tag)}
  {:else}
    {tag.toUpperCase()}
  {/if}

  {#if tag == 'swarm'}
    [beta]
  {/if}

</span>

<style>
.tag {
  background-color: #ddd;
  border-radius: 2px;
  color: #555;
  padding: 2px 2px 1px 2px;
  font-size: 0.8em;
}

/* (some) resultTypes ==> */

.swarmTag, .swarmstagingTag {
  /*color: #555;*/
  /*color: white;*/
  color: #FFAF28;
  /*background-color: #FFA500;*/
  background: none;
  font-style: italic;
}

.ensTag {
  background-color: #5284FF;
  color: white;
}

/* mediaTypes ==> */

.videoTag {
  color: white;
  background-color: #7A3D12;
  color: #333;
  background-color: #FFD878;
}

.musicTag {
  color: white;
  color: #333;
  /*background-color: #44BAA8;*/
  background-color: var(--zeta-green);
}

.imageTag {
  color: white;
  background-color: #C76479;
}

.pdfTag {
  color: white;
  background-color: #575DC9;
}

.txtTag {
  color: #CCC;
  background-color: #444;
}

.noteTag {
  color: white;
  background-color: #679536;
}

</style>
