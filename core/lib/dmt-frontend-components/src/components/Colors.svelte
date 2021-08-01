<!--
We need some markup here for this component to work
Colors component is not actually rendered anywhere, just included on top in App.svelte usually:

import { Colors } from 'dmt-frontend-components';

and it even doesn't have to be as long as just one dmt-frontend-component is imported
(no idea why is this so, rollup or vite obviously evaluate all exports from index.js even if not used)
-->
<span></span>

<!-- TODO: colors from DMT-GUI are not yet here, maybe there are some differences, check! -->

<style>
:root {
  /* check if we need 'warning' */
  --warning: #e34042;
  --dmt-red: var(--warning);
  --dmt-dark-red: #983128;

  --dmt-orange: #E46F3C;
  --dmt-yellow: #dfdb83;
  /*zetaseek yellow-->?*/
  --dmt-warm-yellow: #FEC83B;
  --dmt-gray: #8e8d96;
  --dmt-light-gray: #999;
  --dmt-dark-gray: #454545;
  --dmt-silver: #99b1ba;
  --dmt-black: #333;

  --dmt-blue: #8592D2;
  --dmt-navy: #41468f;
  --dmt-navy2: #292c5a;

  --dmt-green: #00ffbd;
  --dmt-green-yellow: #D6F3DB;
  --dmt-cool-green: #5df699;
  --dmt-crypto-green: #00bfb6; /* only used in cryptoschool, do we need this? */
  --dmt-vibrant-green: #5fe02a;

  --dmt-cyan: #29b3bf;
  --dmt-light-cyan: #68f5e7;

  /*todo: check where bright-cyan is actually used and remove, it's almost the same as dmt-system-cyan*/
  --dmt-bright-cyan: #3dffec;
  --dmt-system-cyan: #3effe5;

  --dmt-cool-cyan: #51f5c8;
  /*todo: rename into something else*/
  --dmt-cool-cyan2: #58e288;

  --dmt-violet: #986aeb;
  /*zetaseek violet-->?*/
  /*--dmt-violet: #873bbf;*/
  --dmt-dark-violet: #2e1740;
  --dmt-pink: #efcaf8;
  --dmt-warm-pink: #F4B5BD;
  --dmt-warmer-pink: #EEBFC9;

  --dmt-magenta: #2b294c;
  --dmt-light-magenta: #9aa9ef;
  --dmt-lighter-magenta: #CAD2FF;

  --dmt-cool-green-rgb: 93, 246, 153;
  --dmt-cool-cyan-rgb: 81, 245, 200;

  --zeta-green: #31e5c1;
  --zeta-green-highlight: #34fed7;
  --zeta-green_check: rgb(55, 136, 124);
  /*--zeta-green_check: #32e6be;*/
  --zeta-dark-green: #248576;
}
</style>
