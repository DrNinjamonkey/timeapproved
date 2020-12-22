<script>
  export let contractorData;
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
  {#each contractorData as row}
    <div class="dash-row">
      <div class="white-box progress-box">
        <div class="box-padding">
          <div class="data-row">
            <div class="text-col">
              <div class="ts-text">{row.createdDate}</div>
            </div>
            <div class="text-col">
              <div class="ts-text small">{row.contractName}</div>
            </div>
            <div class="text-col">
              <div class="ts-text">{row.startDate}</div>
            </div>
            <div class="text-col">
              <div class="ts-text">{row.total} {row.unit}</div>
            </div>
            <div class="text-col">
              <div
                class="status"
                class:approved={(row.status === 'Approved')}
                class:rejected={(row.status === 'Rejected')}
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
