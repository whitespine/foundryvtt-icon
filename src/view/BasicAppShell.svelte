<script>
   import { ApplicationShell }   from '#runtime/svelte/component/core';
   import Clock   from '../components/Clock.svelte';

   export let elementRoot;
   let clocks = [];
   for(let i=2; i<10; i++) {
      clocks.push({
         size: i,
         value: Math.floor(Math.random() * (i+1))
      })
   }
   let tickTockClock = {
      size: 2,
      value: 3
   }
   setInterval(() => {tickTockClock.size++}, 1000)
</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true}/>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->
<ApplicationShell bind:elementRoot>
   <main>
      <h1>Basic application</h1>
      <div style="grid: auto-flow / 1fr 1fr 1fr">
         {#each clocks as c}
            <Clock size={c.size} bind:value={c.value}></Clock> 
         {/each}
         <Clock size={tickTockClock.size} bind:value={tickTockClock.value}></Clock> 
      </div>
   </main>
</ApplicationShell>

<style lang="scss">
   main {
      text-align: center;
      display: flex;
      flex-direction: column;
   }
</style>