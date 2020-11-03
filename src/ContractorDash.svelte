<script>
import LoadingScreen from "./Components/LoadingScreen.svelte";

</script>
<div class="dashboard-container contractor">
  <h3 class="heading">Your Timesheets</h3>
  <div class="dash-row">
    <div class="white-box progress-box">
      <div class="box-padding">
        <div class="data-row">
          <div class="text-col">
            <div class="ts-data">
              <div class="ts-text title">Date Created</div>
            </div>
          </div>
          <div class="text-col">
            <div class="ts-data">
              <div class="ts-text title">Contract</div>
            </div>
          </div>
          <div class="text-col">
            <div class="ts-data">
              <div class="ts-text title">W/C</div>
            </div>
          </div>
          <div class="text-col">
            <div class="ts-data">
              <div class="ts-text title">Total</div>
            </div>
          </div>
          <div class="text-col">
            <div class="ts-data">
              <div class="ts-text title">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="dash-row">
    <div class="white-box progress-box">
      <div class="box-padding">
        <div class="data-row">
          <div class="text-col">
            <div class="ts-text">05-10-20</div>
          </div>
          <div class="text-col">
            <div class="ts-text small">Emb Linux</div>
            <div class="ts-text small">Platform</div>
          </div>
          <div class="text-col">
            <div class="ts-text">Platform</div>
          </div>
          <div class="text-col">
            <div class="ts-text">57 Hours</div>
          </div>
          <div class="text-col">
            <div class="status approved">
              <div class="ts-text">Approved</div><img
                src="images/download-4---filled24x242x.svg"
                loading="lazy"
                height="20"
                alt="download icon"
                width="20"
                class="download-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="dash-row">
    <div class="white-box progress-box">
      <div class="box-padding">
        <div class="data-row">
          <div class="text-col">
            <div class="ts-text">05-10-20</div>
          </div>
          <div class="text-col">
            <div class="ts-text">Emb Linux</div>
          </div>
          <div class="text-col">
            <div class="ts-text">Platform</div>
          </div>
          <div class="text-col">
            <div class="ts-text">57 Hours</div>
          </div>
          <div class="text-col">
            <div class="status pending">
              <div class="ts-text">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="dash-row">
    <div class="white-box progress-box">
      <div class="box-padding">
        <div class="data-row">
          <div class="text-col">
            <div class="ts-text">05-10-20</div>
          </div>
          <div class="text-col">
            <div class="ts-text">Emb Linux</div>
          </div>
          <div class="text-col">
            <div class="ts-text">Platform</div>
          </div>
          <div class="text-col">
            <div class="ts-text">57 Hours</div>
          </div>
          <div class="text-col">
            <div class="status rejected">
              <div class="ts-text">Rejected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <a href="_" class="menu-add w-button">+</a>
<LoadingScreen/>
    </div>
