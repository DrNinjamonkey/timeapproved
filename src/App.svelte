<script>
  import Datepicker from "svelte-calendar";
  import dayjs from "dayjs";
  import Form from "@svelteschool/svelte-forms";

  let dayInputValid = true;
  let candEmail;
  let candEmailValid = true;
  let managerEmail;
  let managerEmailValid = true;
  let timesheetData = {};
  let timesheetDataBetter = {};
  let weeks = 0;
  let dateFormat = "#{d}/#{m}/#{Y}";
  let formattedSelected;
  let dateChosen = false;
  let selectedDate;
  let includeWeekends = false;
  let timeSheetUnitSelected = "hourly";
  const today = new Date();
  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
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

  const getFormData = () => {
    dayInputValid = true;
    candEmailValid = validateEmail(candEmail);
    managerEmailValid = validateEmail(managerEmail);
    if (!candEmailValid || !managerEmailValid) return;

    timesheetDataBetter = {};
    timesheetDataBetter.weeks = [];
    timesheetDataBetter.timeUnitSelected = timeSheetUnitSelected;
    timesheetDataBetter.managerEmail = timesheetData.manageremailinput;
    timesheetDataBetter.candidateEmail = timesheetData.emailinput;
    timesheetDataBetter.projectDesc = timesheetData.projectDesc;
    for (let i = 0; i < weeks + 1; i++) {
      timesheetDataBetter.weeks.push({
        weekCommencing: weekDates[i],
        mon: +timesheetData[`monWeek${i + 1}`],
        tue: +timesheetData[`tueWeek${i + 1}`],
        wed: +timesheetData[`wedWeek${i + 1}`],
        thu: +timesheetData[`thuWeek${i + 1}`],
        fri: +timesheetData[`friWeek${i + 1}`],
        sat: +timesheetData[`satWeek${i + 1}`],
        sun: +timesheetData[`sunWeek${i + 1}`],
      });

      Object.keys(timesheetDataBetter.weeks[i])
        .filter((key) => key != "weekCommencing")
        .map((key) => {
          if (
            (timeSheetUnitSelected === "hourly" &&
              timesheetDataBetter.weeks[i][key] > 16) ||
            (timeSheetUnitSelected === "daily" &&
              timesheetDataBetter.weeks[i][key] > 1)
          ) {
            dayInputValid = false;
          }
        });
      // if any date is less than one or more than 16 throw error
    }
    if (!dayInputValid) return;
    console.log(timesheetDataBetter);
    console.log(timesheetData);
    async () => {
      await fetch(
        `https://hook.integromat.com/qm43sxmnkfnkhiqdhaosipmeojppgtm7?${timesheetDataBetter}`
      ).catch((err) => console.log(err));
    };
  };
</script>

<!-- //  redirect="/success" data-redirect="/success" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfa4w80QHhQ86KfD4--eP2ds0vCJseMC9C9Pjzy2-sM3ODG7w/formResponse" method="post" -->
<style>
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>

<div class="form-full">
  <div class="form-wrapper w-form">
    <Form bind:values={timesheetData}>
      <div class="form-content">
        <div class="form-title-wrap">
          <div class="form-section-title">Fill in your timesheet</div>
          <div class="paragraph">
            Do you record time hourly or daily?
          </div><select
            on:click={() => (dayInputValid = true)}
            id="time-unit-select"
            name="time-unit-select"
            data-name="time-unit-select"
            required=""
            class="field-input select w-select"
            bind:value={timeSheetUnitSelected}><option value="hourly">
              Hourly
            </option>
            <option value="daily">Daily</option></select>
          <label class="w-checkbox"><input
              type="checkbox"
              bind:checked={includeWeekends}
              id="weekend-checkbox"
              name="weekend-checkbox"
              data-name="weekend-checkbox"
              class="w-checkbox-input" /><span
              for="weekend-checkbox"
              class="paragraph w-form-label">Include weekends?</span></label>
        </div>

        <p class="paragraph">
          Please tell us the Monday you want your timesheet to start on
        </p>
      </div>
      <div class="form-content-wrap vertical">
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

        <div class="form-content-wrap week-row">
          <div class="week-info">
            {#if dateChosen}
              <div class="week-info-text">Week Commencing</div>
              <div class="week-info-text">
                {weekDates[0].format('DD/MM/YYYY')}
              </div>
            {/if}
          </div>

          {#if dateChosen}
            <div class="day-wrap">
              <div class="day-label">MON</div><input
                type="number"
                min="0"
                class="field-input time-unit w-input"
                class:error={(timesheetData.monWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.monWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                maxlength="256"
                name="monWeek1"
                data-name="monWeek1"
                placeholder="0"
                value="0"
                required
                id="mon" />
            </div>
            <div class="day-wrap">
              <div class="day-label">TUE</div><input
                type="number"
                min="0"
                max="16"
                class="field-input time-unit w-input"
                class:error={(timesheetData.tueWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.tueWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                maxlength="256"
                name="tueWeek1"
                data-name="tueWeek1"
                placeholder="0"
                value="0"
                required
                id="tue" />
            </div>
            <div class="day-wrap">
              <div class="day-label">WED</div><input
                type="number"
                min="0"
                max="16"
                class="field-input time-unit w-input"
                class:error={(timesheetData.wedWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.wedWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                maxlength="256"
                name="wedWeek1"
                data-name="wedWeek1"
                placeholder="0"
                value="0"
                required
                id="wed" />
            </div>
            <div class="day-wrap">
              <div class="day-label">THU</div><input
                type="number"
                min="0"
                max="16"
                class="field-input time-unit w-input"
                class:error={(timesheetData.thuWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.thuWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                maxlength="256"
                name="thuWeek1"
                data-name="thuWeek1"
                placeholder="0"
                value="0"
                required
                id="thu" />
            </div>
            <div class="day-wrap">
              <div class="day-label">FRI</div><input
                type="number"
                min="0"
                max="16"
                class="field-input time-unit w-input"
                class:error={(timesheetData.friWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.friWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                maxlength="256"
                name="friWeek1"
                data-name="friWeek1"
                placeholder="0"
                value="0"
                required
                id="fri" />
            </div>
            {#if includeWeekends}
              <div class="weekend-wrap">
                <div class="day-wrap">
                  <div class="day-label">SAT</div><input
                    type="number"
                    min="0"
                    max="16"
                    class="field-input time-unit w-input"
                    class:error={(timesheetData.satWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.satWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                    maxlength="256"
                    name="satWeek1"
                    data-name="satWeek1"
                    placeholder="0"
                    value="0"
                    required
                    id="sat" />
                </div>
                <div class="day-wrap">
                  <div class="day-label">SUN</div><input
                    type="number"
                    min="0"
                    max="16"
                    class="field-input time-unit w-input"
                    class:error={(timesheetData.sunWeek1 > 16 && timeSheetUnitSelected === 'hourly') || (timesheetData.sunWeek1 > 1 && timeSheetUnitSelected === 'daily')}
                    maxlength="256"
                    name="sunWeek1"
                    data-name="sunWeek1"
                    placeholder="0"
                    value="0"
                    required
                    id="sun" />
                </div>
              </div>
            {/if}
          {:else}
            <div class="error-msg">Please select a start date</div>
          {/if}
          {#if dateChosen && weeks == 0}
            <div class="week-button-wrap">
              <input
                type="button"
                class="add-remove-button w-button"
                on:click={() => weeks++}
                value="+" />
            </div>
          {/if}
        </div>
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
        {#if !dayInputValid && timeSheetUnitSelected === 'hourly'}
          <div class="error-msg">
            You can only record between 0 and 16 hours per day!
          </div>
        {:else if !dayInputValid && timeSheetUnitSelected === 'daily'}
          <div class="error-msg">You can only record up to 1 day per day!</div>
        {/if}
        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>Please enter your email address</div>
          </div><input
            type="email"
            bind:value={candEmail}
            class={candEmailValid ? 'field-input w-input' : 'field-input w-input error'}
            maxlength="256"
            name="emailinput"
            data-name="emailinput"
            placeholder="John Smith"
            id="emailinput" />
          {#if !candEmailValid}
            <div class="error-msg">Please enter a valid email address</div>
          {/if}
        </div>
        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>
              Please enter the email address for the person who approves your
              timesheet
            </div>
          </div><input
            type="email"
            bind:value={managerEmail}
            class={managerEmailValid ? 'field-input w-input' : 'field-input w-input error'}
            maxlength="256"
            name="manageremailinput"
            data-name="manageremailinput"
            placeholder="John Smith"
            id="manageremailinput" />
          {#if !managerEmailValid}
            <div class="error-msg">Please enter a valid email address</div>
          {/if}
        </div>
        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>Please give a brief description of what you worked on</div>
          </div><input
            type="text"
            class="field-input longer w-input"
            maxlength="256"
            name="projectDesc"
            data-name="project-placeholder-text"
            placeholder="eg. Wrote custom code for time approved input forms."
            id="project-placeholder-text" />
        </div>
        <div class="form-content final">
          <div class="form-title-wrap">
            <div class="form-section-title">Confirm Submission.</div>
            <p class="paragraph">
              We will not send you any marketing. You will be contacted
              regarding this timesheet and your contact details will be deleted
              in 3 months. If you are interested in a branded timesheet portal
              for your agency please contact us.<br />
            </p>
          </div><button
            on:click|preventDefault={() => getFormData()}
            class="submit-button w-button"
            type="submit">Complete Submission</button>
          <div class="legal-disclaimer">
            By submitting, you are agreeing to our
            <a href class="form07_link">Terms</a>
            and
            <a href class="form07_link">Privacy Policy</a>
          </div>
        </div>
      </div>
    </Form>

    <!-- TO DO Need to show this if the form is submitted correctly and offer a button to show the form again? -->

    <div class="success-message w-form-done">
      <div>
        We will send you a notification when the person who approves your
        timesheets has responded to your submission. If you have not had a
        response in 7 days please communicate directly with the approver.
      </div>
    </div>

    <!-- TO DO Need to show this is the res from form endpoint is not correct. Offer to fill in form again or show support email -->

    <div class="error-message w-form-fail">
      <div>Oops! Something went wrong while submitting the form</div>
    </div>
  </div>
</div>
