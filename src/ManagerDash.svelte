<script>
import LoadingScreen from "./Components/LoadingScreen.svelte";
export let managerData;

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
  {#each managerData as row}
  <div class="dash-row">
    <div class="white-box progress-box">
      <div class="box-padding">
        <div class="data-row">
          <div class="text-col">
            <div class="ts-text">{row.createdDate}</div>
          </div>
          <div class="text-col">
            <div class="ts-text">{row.contractDesc}</div>
          </div>
          <div class="text-col">
            <div class="ts-text small">{row.approvingManager}</div>
          </div>
          <div class="text-col">
            <div class="ts-text small">{row.contractorEmail}</div>
          </div>
          <div class="text-col">
            <div class="status approved"
            class:approved={(row.status === 'Active')}
            class:rejected={(row.status === 'Expired')}
            class:pending={(row.status === 'Added')}>
              <div class="ts-text">{row.status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/each}
  
</div>
