<script>
import LoadingScreen from "./Components/LoadingScreen.svelte";

</script>
<div class="dashboard-container add-timesheet">
    <h3 class="heading">Add a New Contract</h3>
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
                  <div class="form-section-title">
                    Fill in the contract details
                  </div>
                </div>
                <div class="form-content-wrap vertical">
                  <div class="label-with-tooltip">
                    <div>Please enter a short contract title</div>
                  </div><input
                    type="text"
                    class="field-input w-input"
                    maxlength="256"
                    name="contractDesc"
                    data-name="contractDesc"
                    placeholder="C++ Development"
                    id="contractDesc" />
                </div>
                <div class="form-content-wrap vertical">
                  <div class="label-with-tooltip">
                    <div>
                      Please enter the email address for the person who
                      approves the timesheet
                    </div>
                  </div><input
                    type="email"
                    class="field-input w-input"
                    maxlength="256"
                    name="approvingMan"
                    data-name="approvingMan"
                    placeholder="j.smith@yourdomain.com"
                    id="approvingMan-2"
                    required="" />
                </div>
                <div class="form-content-wrap vertical">
                  <div class="label-with-tooltip">
                    <div class="form-instructions">
                      Please enter the email address for the contractor. This
                      should
                      <strong>match their<br />existing timeapproved</strong>
                      account if they have one. If they do not already have<br />one
                      they should sign up with this email address.
                    </div>
                  </div><input
                    type="email"
                    class="field-input w-input"
                    maxlength="256"
                    name="contractorEmail"
                    data-name="contractorEmail"
                    placeholder="contractor@domain.com"
                    id="contractorEmail"
                    required="" />
                </div>
                <div class="form-content final">
                  <input
                    type="submit"
                    value="Add Contract"
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
                Thanks! I have received your form submission, I&#x27;ll get
                back to you shortly!
              </div>
            </div>
            <div class="error-message w-form-fail">
              <div>Oops! Something went wrong while submitting the form</div>
            </div>
          </div>
<LoadingScreen/>
        </div>
      </div>
    </div>
    <a href="_" class="menu-add back w-button">+</a>
  </div>
