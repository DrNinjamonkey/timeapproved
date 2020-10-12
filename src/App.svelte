<script>
  import Date from "Date.svelte";
  import Form from "@svelteschool/svelte-forms";

  let timesheetData;
  let includeWeekends = false;
  let weeks = 0;
  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const getFormData = () => {
    // console.log({
    //   firstWeek: weekDates[0].format("DD/MM/YYYY"),
    //   ...timesheetData,
    // });
    console.log(timesheetData);
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
            id="time-unit-select"
            name="time-unit-select"
            data-name="time-unit-select"
            required=""
            class="field-input select w-select"><option value="hourly">
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
        <!-- <Datepicker
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
          dayHighlightedTextColor="#fff" /> -->
        <Date/>

        <div class="form-content-wrap week-row">
          <div class="week-info">
            {#if dateChosen}
              <div class="week-info-text">Week Commencing</div>
              <div class="week-info-text">
                {weekDates[0].format('DD/MM/YYYY')}
              </div>
            {/if}
          </div>

          <div class="day-wrap">
            <div class="day-label">MON</div><input
              type="number"
              min="0"
              max="16"
              class="field-input time-unit w-input"
              maxlength="256"
              name="mon week 1"
              data-name="mon week 1"
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
              maxlength="256"
              name="tue week 1"
              data-name="tue week 1"
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
              maxlength="256"
              name="wed week 1"
              data-name="wed week 1"
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
              maxlength="256"
              name="thu week 1"
              data-name="thu week 1"
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
              maxlength="256"
              name="fri week 1"
              data-name="fri week 1"
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
                  maxlength="256"
                  name="sat week 1"
                  data-name="sat week 1"
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
                  maxlength="256"
                  name="sun week 1"
                  data-name="sun week 1"
                  placeholder="0"
                  value="0"
                  required
                  id="sun" />
              </div>
            </div>
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
                type="text"
                class="field-input time-unit w-input"
                maxlength="256"
                name="mon week {index + 2}"
                data-name="mon week {index + 2}"
                placeholder="0"
                id="mon" />
            </div>
            <div class="day-wrap">
              <div class="day-label">TUE</div><input
                type="text"
                class="field-input time-unit w-input"
                maxlength="256"
                name="tue week {index + 2}"
                data-name="tue week {index + 2}"
                placeholder="0"
                id="tue" />
            </div>
            <div class="day-wrap">
              <div class="day-label">WED</div><input
                type="text"
                class="field-input time-unit w-input"
                maxlength="256"
                name="wed week {index + 2}"
                data-name="wed week {index + 2}"
                placeholder="0"
                id="wed" />
            </div>
            <div class="day-wrap">
              <div class="day-label">THU</div><input
                type="text"
                class="field-input time-unit w-input"
                maxlength="256"
                name="thu week {index + 2}"
                data-name="thu week {index + 2}"
                placeholder="0"
                id="thu" />
            </div>
            <div class="day-wrap">
              <div class="day-label">FRI</div><input
                type="text"
                class="field-input time-unit w-input"
                maxlength="256"
                name="fri week {index + 2}"
                data-name="fri week {index + 2}"
                placeholder="0"
                id="fri" />
            </div>
            {#if includeWeekends}
              <div class="weekend-wrap">
                <div class="day-wrap">
                  <div class="day-label">SAT</div><input
                    type="text"
                    class="field-input time-unit w-input"
                    maxlength="256"
                    name="sat week {index + 2}"
                    data-name="sat week {index + 2}"
                    placeholder="0"
                    id="sat" />
                </div>
                <div class="day-wrap">
                  <div class="day-label">SUN</div><input
                    type="text"
                    class="field-input time-unit w-input"
                    maxlength="256"
                    name="sun week {index + 2}"
                    data-name="sun week {index + 2}"
                    placeholder="0"
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

        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>Please enter your email address</div>
          </div><input
            type="email"
            class="field-input w-input"
            maxlength="256"
            name="emailinput"
            data-name="emailinput"
            placeholder="John Smith"
            id="emailinput" />
        </div>
        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>
              Please enter the email address for the person who approves your
              timesheet
            </div>
          </div><input
            type="email"
            class="field-input w-input"
            maxlength="256"
            name="manageremailinput"
            data-name="manageremailinput"
            placeholder="John Smith"
            id="manageremailinput" />
        </div>
        <div class="form-content-wrap vertical">
          <div class="label-with-tooltip">
            <div>Please give a brief description of what you worked on</div>
          </div><input
            type="text"
            class="field-input longer w-input"
            maxlength="256"
            name="project-placeholder-text"
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
            <pre>{JSON.stringify({ firstWeekCommencing: weekDates[0].format('DD/MM/YYYY'), ...timesheetData }, undefined, 1)}</pre>
          </div>
        </div>
      </div>
    </Form>

    <div class="success-message w-form-done">
      <div>
        We will send you a notification when the person who approves your
        timesheets has responded to your submission. If you have not had a
        response in 7 days please communicate directly with the approver.
      </div>
    </div>
    <div class="error-message w-form-fail">
      <div>Oops! Something went wrong while submitting the form</div>
    </div>
  </div>
</div>
<pre>{JSON.stringify({ firstWeekCommencing: weekDates[0].format('DD/MM/YYYY'), ...timesheetData }, undefined, 1)}</pre>
