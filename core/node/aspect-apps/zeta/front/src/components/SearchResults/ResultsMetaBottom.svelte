<script>
  import { colorsHTML as colors } from 'dmt-js';

  export let providerResponse;

  function displayResultsMeta(providerResponse) {
    if (providerResponse.error) {
      return colors.red(`⚠️  Error: ${providerResponse.error}`);
    }

    const { meta } = providerResponse;
    const { page, noMorePages, resultCount, resultsFrom, resultsTo, searchTimePretty, networkTimePretty } = meta;

    let time = '';

    if (searchTimePretty) {
      time += colors.gray(` · ${colors.gray('fs')} ${colors.white(searchTimePretty)}`);
    }

    if (networkTimePretty) {
      time += colors.gray(` · ${colors.gray('network')} ${colors.white(networkTimePretty)}`);
    }

    if (resultCount > 0) {
      if (page == 1 && noMorePages) {
        return colors.white(`${resultCount} ${resultCount == 1 ? 'result' : 'results'}${time}`);
      }

      const isLastPage = noMorePages ? colors.white(' (last page)') : '';
      const resultsDescription = `${colors.white(`Results ${resultsFrom} to ${resultsTo}`)}`;
      return colors.gray(`${colors.white(`Page ${page}`)}${isLastPage} → ${resultsDescription}${time}`);
    }

    return colors.gray(`No ${page > 1 ? 'more ' : ''}results${time}`);
  }
</script>

<div class="results_meta">
  {@html displayResultsMeta(providerResponse)}
</div>

<style>
  .results_meta {
    margin-top: 5px;
    font-size: 0.8em;
  }
</style>
