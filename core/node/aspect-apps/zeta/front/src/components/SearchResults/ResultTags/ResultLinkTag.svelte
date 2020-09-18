<script>
  export let tag;
</script>

<span class="tag {tag.replace('-', '').toLowerCase()}Tag">

  {tag.toUpperCase()}

</span>

<style>
.tag {
  background-color: #ddd;
  border-radius: 2px;
  color: #555;
  padding: 2px 4px 1px 2px;

  font-style: italic;
  font-size: 0.7em;
}

.swarmTag, .swarmlegacyTag, .swarmstagingTag {
  /*color: #555;*/
  /*color: white;*/
  color: #FFAF28;
  /*background-color: #FFA500;*/
  background: none;
  font-style: italic;
  /*font-size: 0.8em;*/
}

.swarmlegacyTag {
  color: #996C1B;
}

/* url tags */

.githubTag {
  color: white;
  background-color: #353F92;
}

.youtubeTag {
  color: white;
  background-color: #942620;
}

.mediumTag {
  color: white;
  background-color: #000;
}

.redditTag {
  color: white;
  background-color: #E13715;
}

.hackmdTag {
  color: white;
  background-color: #333;
}

.twitterTag {
  color: white;
  background-color: #2AA3EF;
}

.discordTag {
  color: white;
  background-color: #657BC3;
}

.etherscanTag {
  color: white;
  background-color: #22335A;
}

.substackTag {
  color: white;
  background-color: #FD682B;
}

.coingeckoTag {
  color: #333;
  background-color: #8FC550;
}

/*.mediaTypeIcon {
  opacity: 0.7;
  color: white;
}*/
</style>
