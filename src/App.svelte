<script lang="ts">
  import { onMount } from "svelte";
  import { getTimesheets } from "./apis";
  import LoadingScreen from "./Components/LoadingScreen.svelte";

  import ContractorDash from "./ContractorDash.svelte";
  import ManagerDash from "./ManagerDash.svelte";

  let outsetaToken = "";

  if ((window as any).Outseta) {
    console.log("first");
    outsetaToken = (window as any).Outseta.getAccessToken();
  } else console.log("second");
  outsetaToken = window.location.search.slice(1).split("&")[0].split("=")[1];

  let isLoading = true;
  let isContractor = false;
  let isManager = false;
  let dashData;
  let contractorData;
  let managerData;

    const setUp = async () => {
    console.log(outsetaToken);
    dashData = await getTimesheets(outsetaToken);
    contractorData = dashData.frontEndUserTimesheets;
    managerData = dashData.frontEndUserContracts;
    if (contractorData.length > 0) {
      isContractor = true;
    }
    if (managerData.length > 0) {
      isManager = true;
    }
    console.log(managerData);
    console.log(contractorData);
    isLoading = false;
 }

 (window as any).Outseta.on('accessToken.set', setUp)
 

  // onMount(async () => {
  //   console.log(outsetaToken);
  //   dashData = await getTimesheets(outsetaToken);
  //   contractorData = dashData.frontEndUserTimesheets;
  //   managerData = dashData.frontEndUserContracts;
  //   if (contractorData.length > 0) {
  //     isContractor = true;
  //   }
  //   if (managerData.length > 0) {
  //     isManager = true;
  //   }
  //   console.log(managerData);
  //   console.log(contractorData);
  //   isLoading = false;
  // });
</script>

<LoadingScreen {isLoading} />
{#if isContractor}
  <ContractorDash {contractorData} />
{/if}
{#if isManager}
  <ManagerDash {managerData} />
{/if}
