<script>
import LoadingScreen from "./Components/LoadingScreen.svelte";

</script>
<div class="dashboard-container manager">
    <h3 class="heading">Your Contracts</h3>
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
                <div class="ts-text title">Approving Manager</div>
              </div>
            </div>
            <div class="text-col">
              <div class="ts-data">
                <div class="ts-text title">Contractor</div>
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
              <div class="ts-text">Emb Linux</div>
            </div>
            <div class="text-col">
              <div class="ts-text small">jacevans84+man@gmail.com</div>
            </div>
            <div class="text-col">
              <div class="ts-text small">jacevans84@gmail.com</div>
            </div>
            <div class="text-col">
              <div class="status approved">
                <div class="ts-text">Active</div>
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
              <div class="ts-text small">jacevans84@gmail.com</div>
            </div>
            <div class="text-col">
              <div class="ts-text small">jacevans84@gmail.com</div>
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
              <div class="ts-text small">jacevans84@gmail.com</div>
            </div>
            <div class="text-col">
              <div class="ts-text small">jacevans84@gmail.com</div>
            </div>
            <div class="text-col">
              <div class="status rejected">
                <div class="ts-text">Archived</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a href="_" class="menu-add w-button">+</a>
   <LoadingScreen/>
  </div>