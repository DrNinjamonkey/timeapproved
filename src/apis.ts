const apiURL: string = "https://nocodejac.api.stdlib.com/timeapproved@dev/";

export const getTimesheets = async (jwt: string) => {
  try {
    let response = await fetch(`${apiURL}getTimesheets/`, {
      method: "POST",
      body: JSON.stringify({ token: jwt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let dashData = await response.json();
    console.log(dashData);
    return dashData;
  } catch (e) {
    console.log(e);
  }
};

console.log(new Date(Date.now() + 12096e5))

