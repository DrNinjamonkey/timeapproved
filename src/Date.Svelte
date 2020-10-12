<script>
  import Datepicker from "svelte-calendar";
  import dayjs from "dayjs";

  export let dateChosen = false;
  export let weekDates = [];

  let dateFormat = "#{d}/#{m}/#{Y}";
  let formattedSelected;
  
  let selectedDate;
  const today = new Date();

  let mondaysOnlyCallback = (date) =>
    date.getDay() !== 0 &&
    date.getDay() !== 2 &&
    date.getDay() !== 3 &&
    date.getDay() !== 4 &&
    date.getDay() !== 5 &&
    date.getDay() !== 6;

  let inThirtyDays;
  $: {
    const date = new Date(today);
    date.setDate(date.getDate() + 30);
    inThirtyDays = date;
  }

  let weekTwoStart;
  $: {
    weekTwoStart = dayjs(selectedDate).add(7, "day");
  }

  $: {
    weekDates = [
      dayjs(selectedDate),
      dayjs(selectedDate).add(7, "day"),
      dayjs(selectedDate).add(14, "day"),
      dayjs(selectedDate).add(21, "day"),
      dayjs(selectedDate).add(28, "day"),
      dayjs(selectedDate).add(35, "day"),
    ];
  }
</script>

<Datepicker
  format={dateFormat}
  end={inThirtyDays}
  selectableCallback={mondaysOnlyCallback}
  bind:formattedSelected
  bind:dateChosen
  bind:selected={selectedDate}
  buttonBackgroundColor="#0064fe"
  buttonTextColor="white"
  highlightColor="#0064fe"
  dayBackgroundColor="#efefef"
  dayTextColor="#333"
  dayHighlightedBackgroundColor="#0064fe"
  dayHighlightedTextColor="#fff" />
