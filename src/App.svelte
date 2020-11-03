<script lang="ts">
 import ContractorDash from "./ContractorDash.svelte";
import ManagerDash from "./ManagerDash.svelte";
import NewContract from "./NewContract.svelte";
import NewTimesheet from "./NewTimesheet.svelte";
let isContractor = true;
let isManager = false;
let addTimesheet = false;
let addContract = false;
</script>

<body class="body dashboard">
  <div class="page-wrapper">
    {#if isContractor}
    <ContractorDash/>
    {/if}
    {#if isManager}
    <ManagerDash/>
    {/if}
    {#if addTimesheet}
    <NewTimesheet/>
    {/if}
    {#if addContract}
    <NewContract/>
    {/if}
</div>
</body>
