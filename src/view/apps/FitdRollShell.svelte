<script>
   import { ApplicationShell }   from '#runtime/svelte/component/core';

   export let elementRoot;
</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true}/>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->
<ApplicationShell bind:elementRoot>
   <main>
      <h1>Road rolla</h1>
   </main>
</ApplicationShell>

<style lang="scss">
   main {
   }
</style>