<script>
  import ResultTags from '../ResultTags/ResultTags.svelte';

  export let noteUrl;
  export let notePreview;
  export let noteTags;
</script>

<ResultTags resultType="note" />

<a href="{noteUrl}">
  {notePreview} <span class="note_tags">[{noteTags}]</span>
</a>

<style>
  .note_tags {
    color: #679536;
  }
</style>
