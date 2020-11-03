<script>
import LoadingScreen from "./Components/LoadingScreen.svelte";

</script>
<div class="dashboard-container add-timesheet">
    <h3 class="heading">Add a New Timesheet</h3>
    <div class="dash-row">
      <div class="white-box progress-box">
        <div class="box-padding">
          <div class="form-wrapper w-form">
            <form
              id="email-form"
              name="email-form"
              data-name="Email Form"
              redirect="/success"
              data-redirect="/success"
              action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfa4w80QHhQ86KfD4--eP2ds0vCJseMC9C9Pjzy2-sM3ODG7w/formResponse"
              method="post">
              <div class="form-content">
                <div class="form-title-wrap">
                  <div class="form-section-title">Fill in your timesheet</div>
                  <p class="paragraph top">
                    Please tell us the Monday you want your timesheet to start
                    on
                  </p>
                </div>
                <div class="form-content-wrap vertical">
                  <input
                    type="text"
                    class="field-input date w-input"
                    maxlength="256"
                    name="timesheetstartdate-2"
                    data-name="Timesheetstartdate 2"
                    placeholder="Timesheet Start"
                    id="timesheetstartdate-2" /><label
                    class="w-checkbox"><input
                      type="checkbox"
                      id="weekend-checkbox-2"
                      name="weekend-checkbox-2"
                      data-name="Weekend Checkbox 2"
                      class="w-checkbox-input" /><span
                      for="weekend-checkbox-2"
                      class="paragraph w-form-label">Include weekends?</span></label>
                  <div class="paragraph">
                    Please enter the number of units per day.
                  </div>
                </div>
                <div class="form-content-wrap week-row">
                  <div class="week-info">
                    <div class="week-info-text">Week Commencing</div>
                    <div class="week-info-text">WEEK</div>
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">MON</div><input
                      type="text"
                      class="field-input time-unit w-input"
                      maxlength="256"
                      name="mon-2"
                      data-name="Mon 2"
                      placeholder="0"
                      id="mon-2" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">TUE</div><input
                      type="text"
                      class="field-input time-unit w-input"
                      maxlength="256"
                      name="tue-2"
                      data-name="Tue 2"
                      placeholder="0"
                      id="tue-2" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">WED</div><input
                      type="text"
                      class="field-input time-unit w-input"
                      maxlength="256"
                      name="wed-2"
                      data-name="Wed 2"
                      placeholder="0"
                      id="wed-2" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">THU</div><input
                      type="text"
                      class="field-input time-unit w-input"
                      maxlength="256"
                      name="thu-2"
                      data-name="Thu 2"
                      placeholder="0"
                      id="thu-2" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">FRI</div><input
                      type="text"
                      class="field-input time-unit w-input"
                      maxlength="256"
                      name="fri-2"
                      data-name="Fri 2"
                      placeholder="0"
                      id="fri-2" />
                  </div>
                  <div class="weekend-wrap">
                    <div class="day-wrap">
                      <div class="day-label">SAT</div><input
                        type="text"
                        class="field-input time-unit w-input"
                        maxlength="256"
                        name="sat-2"
                        data-name="Sat 2"
                        placeholder="0"
                        id="sat-2" />
                    </div>
                    <div class="day-wrap">
                      <div class="day-label">SUN</div><input
                        type="text"
                        class="field-input time-unit w-input"
                        maxlength="256"
                        name="sun-2"
                        data-name="Sun 2"
                        placeholder="0"
                        id="sun-2" />
                    </div>
                  </div>
                  <div class="week-button-wrap">
                    <a
                      href="_"
                      class="add-remove-button remove w-button">–</a>
                    <a href="_" class="add-remove-button w-button">+</a>
                  </div>
                </div>
                <div class="form-content-wrap week-row">
                  <div class="day-wrap">
                    <div class="day-label">MON</div><input
                      type="text"
                      maxlength="256"
                      name="entry.477314549"
                      data-name="entry.477314549"
                      placeholder="0"
                      class="field-input time-unit error w-input" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">TUE</div><input
                      type="text"
                      maxlength="256"
                      name="entry.919645818"
                      data-name="entry.919645818"
                      placeholder="0"
                      class="field-input time-unit w-input" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">WED</div><input
                      type="text"
                      maxlength="256"
                      name="entry.2083568294"
                      data-name="entry.2083568294"
                      placeholder="0"
                      class="field-input time-unit w-input" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">THU</div><input
                      type="text"
                      maxlength="256"
                      name="entry.317335576"
                      data-name="entry.317335576"
                      placeholder="0"
                      class="field-input time-unit w-input" />
                  </div>
                  <div class="day-wrap">
                    <div class="day-label">FRI</div><input
                      type="text"
                      maxlength="256"
                      name="entry.1927404421"
                      data-name="entry.1927404421"
                      placeholder="0"
                      class="field-input time-unit w-input" />
                  </div>
                  <div class="weekend-wrap">
                    <div class="day-wrap">
                      <div class="day-label">SAT</div><input
                        type="text"
                        maxlength="256"
                        name="entry.1043325632"
                        data-name="entry.1043325632"
                        placeholder="0"
                        class="field-input time-unit w-input" />
                    </div>
                    <div class="day-wrap">
                      <div class="day-label">SUN</div><input
                        type="text"
                        maxlength="256"
                        name="entry.956646951"
                        data-name="entry.956646951"
                        placeholder="0"
                        class="field-input time-unit w-input" />
                    </div>
                  </div>
                  <div class="week-info">
                    <div class="week-info-text">Week Commencing</div>
                    <div class="week-info-text">WEEK</div>
                  </div>
                  <div class="week-button-wrap">
                    <a
                      href="_"
                      class="add-remove-button remove w-button">–</a>
                    <a href="_" class="add-remove-button w-button">+</a>
                  </div>
                </div>
                <div class="form-content-wrap vertical">
                  <div class="label-with-tooltip">
                    <div>
                      Please give a brief description of what you worked on
                    </div>
                  </div><input
                    type="text"
                    class="field-input longer w-input"
                    maxlength="256"
                    name="project-placeholder-text-2"
                    data-name="Project Placeholder Text 2"
                    placeholder="eg. Wrote custom code for time approved input forms."
                    id="project-placeholder-text-2" />
                </div>
                <div class="form-content final">
                  <input
                    type="submit"
                    value="Complete Submission"
                    data-wait="Working on that..."
                    wait="Calculating Nash Equilibrium..."
                    data-ix="show-content-onslide"
                    class="submit-button w-button" />
                  <div class="legal-disclaimer">
                    By submitting, you are agreeing to our
                    <a href="_" class="form-link">Terms</a>
                    and
                    <a href="_" class="form-link">Privacy Policy</a>
                  </div>
                </div>
              </div>
            </form>
            <div class="success-message w-form-done">
              <div>
               Success message text
              </div>
            </div>
            <div class="error-message w-form-fail">
              <div>Oops! Something went wrong while submitting the form</div>
            </div>
          </div>
         </div></div>
<LoadingScreen/>
    </div>
    <a href="_" class="menu-add back w-button">+</a>
  </div>