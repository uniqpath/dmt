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

</span>

<style>
.tag {
  background-color: #ddd;
  border-radius: 2px;
  color: #555;
  padding: 0 2px;
}

/* (some) resultTypes ==> */

.swarmTag {
  /*color: #555;*/
  /*color: white;*/
  color: #FFAF28;
  /*background-color: #FFA500;*/
  background: none;
  font-style: italic;
  font-size: 0.8em;
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
  background-color: #B54195;
  font-size: 0.8em;
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

/*.mediaTypeIcon {
  opacity: 0.7;
  color: white;
}*/
</style>
