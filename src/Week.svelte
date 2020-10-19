<script>
export let selectedDate;
export let timesheetData;
export let timeSheetUnitSelected;
export let weeks;
export let includeWeekends;
import dayjs from "dayjs";

let weekDates = [];
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

{#each Array(weeks) as week, index}
<div class="form-content-wrap week-row">
    <div class="week-info">
      <div class="week-info-text">Week Commencing</div>
      <div class="week-info-text">
        {weekDates[index + 1].format('DD/MM/YYYY')}
      </div>
    </div>
    <div class="day-wrap">
      <div class="day-label">MON</div><input
        type="number"
        class={'field-input time-unit w-input'}
        class:error={(timesheetData[`monWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`monWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
        maxlength="256"
        name="monWeek{index + 2}"
        data-name="monWeek{index + 2}"
        placeholder="0"
        value="0"
        id="mon" />
    </div>
    <div class="day-wrap">
      <div class="day-label">TUE</div><input
        type="text"
        class="field-input time-unit w-input"
        class:error={(timesheetData[`tueWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`tueWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
        maxlength="256"
        name="tueWeek{index + 2}"
        data-name="tueWeek{index + 2}"
        placeholder="0"
        value="0"
        id="tue" />
    </div>
    <div class="day-wrap">
      <div class="day-label">WED</div><input
        type="text"
        class="field-input time-unit w-input"
        class:error={(timesheetData[`wedWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`wedWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
        maxlength="256"
        name="wedWeek{index + 2}"
        data-name="wedWeek{index + 2}"
        placeholder="0"
        value="0"
        id="wed" />
    </div>
    <div class="day-wrap">
      <div class="day-label">THU</div><input
        type="text"
        class="field-input time-unit w-input"
        class:error={(timesheetData[`thuWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`thuWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
        maxlength="256"
        name="thuWeek{index + 2}"
        data-name="thuWeek{index + 2}"
        placeholder="0"
        value="0"
        id="thu" />
    </div>
    <div class="day-wrap">
      <div class="day-label">FRI</div><input
        type="text"
        class="field-input time-unit w-input"
        class:error={(timesheetData[`friWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`friWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
        maxlength="256"
        name="friWeek{index + 2}"
        data-name="friWeek{index + 2}"
        placeholder="0"
        value="0"
        id="fri" />
    </div>
    {#if includeWeekends}
      <div class="weekend-wrap">
        <div class="day-wrap">
          <div class="day-label">SAT</div><input
            type="text"
            class="field-input time-unit w-input"
            class:error={(timesheetData[`satWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`satWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
            maxlength="256"
            name="satWeek{index + 2}"
            data-name="satWeek{index + 2}"
            placeholder="0"
            value="0"
            id="sat" />
        </div>
        <div class="day-wrap">
          <div class="day-label">SUN</div><input
            type="text"
            class="field-input time-unit w-input"
            class:error={(timesheetData[`sunWeek${index + 2}`] > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData[`sunWeek${index + 2}`] > 1 && timeSheetUnitSelected === 'daily')}
            maxlength="256"
            name="sunWeek{index + 2}"
            data-name="sunWeek{index + 2}"
            placeholder="0"
            value="0"
            id="sun" />
        </div>
      </div>
    {/if}
    {#if weeks == index + 1}
      <div class="week-button-wrap">
        <input
          type="button"
          class="add-remove-button remove w-button"
          on:click={() => weeks--}
          value="–" />
        {#if weeks < 5}
          <input
            type="button"
            class="add-remove-button w-button"
            on:click={() => weeks++}
            value="+" />
        {/if}
      </div>
    {/if}
  </div>
  {/each}