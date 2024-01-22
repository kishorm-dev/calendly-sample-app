document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

async function init() {
  window.client = await app.initialized();
}

async function getApiKey() {
  try {
    const { currentHost } = await client.data.get("currentHost");
    return currentHost["api_keys"]["freshworks_crm"];
  } catch (error) {
    console.error("Error while retrieving current host :", error);
  }
}

async function autoFetchApi(args) {
  if (args === true) {
    const api_key = await getApiKey();
    utils.set("api_key", { value: api_key });
  } else {
    utils.set("api_key", { value: "" });
  }
}
