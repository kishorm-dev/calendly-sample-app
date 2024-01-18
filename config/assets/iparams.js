document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

const apiToggler = document.querySelector("#api-toggle");
const apiInput = document.querySelector("#api-key");

apiToggler.addEventListener("fwChange", async () => {
  apiInput.toggleAttribute("disabled");
  if (apiInput.value == "") {
    apiInput.value = await getApiKey();
  }
});

async function init() {
  window.client = await app.initialized();
  console.log(await client.data.get("currentHost"));
}

async function getApiKey() {
  try {
    const { currentHost } = await client.data.get("currentHost");
    console.log(currentHost["api_keys"]);
    return currentHost["api_keys"]["freshworks_crm"];
  } catch (error) {
    console.error("Error while retrieving current host :", error);
  }
}

function getConfigs(configs) {
  console.log(configs);
  console.log("getConfigs");
  apiInput.value = configs["api_key"];
}

// function validate() {
//   let isValid = true;
//   if (apiInput.value === "" || apiInput.value === undefined) {
//     isValid = false;
//   }
//   return isValid;
// }

function postConfigs() {
  let api_key = {};

  if (apiToggler.checked === true) {
    api_key["api_key"] = apiInput.value;
  }
  getApiKey().then((data) => {
    api_key["api_key"] = data;
  });

  return api_key;
}
