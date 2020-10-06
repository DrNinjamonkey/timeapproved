<script>
  import Datepicker from 'svelte-calendar';
  import dayjs from 'dayjs';
 // import formatDate from 'timeUtils'

  let weeks = 0;
  let dateFormat = '#{d}/#{m}/#{Y}';
  let formattedSelected;
  let dateChosen = false;
  let selectedDate;
  const today = new Date();
	let mondaysOnlyCallback = (date) => date.getDay() !== 0 && date.getDay() !==2 && date.getDay() !==3 && date.getDay() !==4 && date.getDay() !==5 && date.getDay() !== 6;

	let inThirtyDays;
	$: {
	  const date = new Date(today);
	  date.setDate(date.getDate() + 30);
	  inThirtyDays = date;
  }
  
	let weekTwoStart;
	$: {
    weekTwoStart = dayjs(selectedDate).add(7, 'day');
  }

  let weekDates = [];
  $: {
    weekDates = [
    dayjs(selectedDate),
    dayjs(selectedDate).add(7, 'day'),
    dayjs(selectedDate).add(14, 'day'),
    dayjs(selectedDate).add(21, 'day'),
    dayjs(selectedDate).add(28, 'day'),
    dayjs(selectedDate).add(35, 'day')
]}
</script>


<style>
</style>

<main>

  <div class='text-center'>
    <Datepicker format={dateFormat} end={inThirtyDays} selectableCallback={mondaysOnlyCallback}
    bind:formattedSelected
    bind:dateChosen
    bind:selected={selectedDate}
    buttonBackgroundColor='#e20074'
    buttonTextColor='white'
    highlightColor='#e20074'
    dayBackgroundColor='#efefef'
    dayTextColor='#333'
    dayHighlightedBackgroundColor='#e20074'
    dayHighlightedTextColor='#fff' />
	</div>
{#if dateChosen}
<div class='text-center'>
  <label>Week Commencing:{weekDates[0].format('DD/MM/YYYY')} <input type="number" class="field-input hours w-input"/></label>
</div >
  {#each Array(weeks) as week, index}
  <div class='text-center'>
    <label>Week Commencing:{weekDates[index+1].format('DD/MM/YYYY')} <input type="number" class="field-input hours w-input"/></label>
  </div>
  {/each}
  <input type="button" on:click={() => weeks++} value="Add Week" />
  {#if weeks>0}
  <input type="button" on:click={() => weeks--} value="Remove Week" />
  {/if}
 {/if} 
</main>
