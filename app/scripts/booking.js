document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

async function init() {
  window.client = await app.initialized();
  renderWidget();
}

async function renderWidget() {
  const { userDetails, contactDetails } = await getData();
  Calendly.initInlineWidget({
    url: "https://calendly.com/" + userDetails.slug,
    prefill: {
      name:
        contactDetails.name ||
        `${contactDetails.first_name} ${contactDetails.last_name}`,
      email: contactDetails.email,
    },
  });
}

async function getData() {
  try {
    client.instance.resize({ height: "100vh" });
    let modalData = await client.instance.context();
    return modalData.data;
  } catch (error) {
    console.error(error);
  }
}

function isCalendlyEvent(e) {
  return e.data.event && e.data.event.indexOf("calendly") === 0;
}

window.addEventListener("message", async function (e) {
  if (isCalendlyEvent(e) && e.data.event == "calendly.profile_page_viewed") {
    document.getElementById("booking-loader")?.remove();
  }
  if (isCalendlyEvent(e) && e.data.event == "calendly.event_scheduled") {
    showToast("success", "Events Scheduled Successfully.");
  }
});

async function closeModal(url) {
  try {
    client.instance.close();
    await client.instance.send({
      message: {
        link: url,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
