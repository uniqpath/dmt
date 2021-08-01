<script>
  export let value;
  export let min;
  export let max;

  $: percentage = ((value - min) / (max - min)) * 100;
</script>

<input type="range" bind:value {min} {max} style="--progress-percentage: {percentage}%" {...$$restProps} on:input />

<style>
  /* Thanks */
  /* https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/ */
  /* https://stackoverflow.com/questions/18389224/how-to-style-html5-range-input-to-have-different-color-before-and-after-slider */

  input {
    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
    width: 100%; /* Specific width is required for Firefox. */
    height: 20px;
    margin: 0;
    padding: 0;
    background: transparent; /* Otherwise white in Chrome */
  }

  input:disabled {
    opacity: 0.4;
  }

  /* WebKit */
  /* Special styling for WebKit/Blink */
  input::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: var(--dmt-cool-green);
    cursor: pointer;
    margin-top: -4px;
  }

  /* All the same stuff for Firefox */
  input::-moz-range-thumb {
    border: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: var(--dmt-cool-green);
    cursor: pointer;
  }

  /* All the same stuff for IE */
  input::-ms-thumb {
    border: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: var(--dmt-cool-green);
    cursor: pointer;
  }

  /* WebKit Track */
  input::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    border: none;
    background: linear-gradient(
      to right,
      var(--dmt-cool-green) 0%,
      var(--dmt-cool-green) var(--progress-percentage),
      var(--dmt-gray) var(--progress-percentage),
      var(--dmt-gray) 100%
    );
    border-radius: 2px;
  }

  /* FF Track */
  input::-moz-range-progress {
    width: 100%;
    height: 4px;
    cursor: pointer;
    border: none;
    background-color: var(--dmt-cool-green);
    border-radius: 2px;
  }

  input::-moz-range-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    border: none;
    background-color: var(--dmt-gray);
    border-radius: 2px;
  }

  /* IE Track */
  input::-ms-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    border: none;
    background-color: var(--dmt-cool-green);
    border-color: transparent;
    color: transparent;
    border-radius: 2px;
  }

  input::-ms-fill-lower {
    border: none;
    background-color: var(--dmt-cool-green);
    border-radius: 2px;
  }

  input::-ms-fill-upper {
    border: none;
    background-color: var(--dmt-gray);
    border-radius: 2px;
  }
</style>
