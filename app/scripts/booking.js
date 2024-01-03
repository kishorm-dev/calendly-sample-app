document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

async function init() {
  try {
    window.client = await app.initialized();
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
  } catch (error) {
    console.error("Calendly - Error while initializing app - ", error);
  } finally {
    console.info("Calendly - App initializing block executed in booking modal");
  }
}

async function getData() {
  try {
    client.instance.resize({ height: "100vh" });
    let modalData = await client.instance.context();
    return modalData.data;
  } catch (error) {
    console.error("Calendly - Error retrieving data from modal - ", error);
    console.error(error);
  } finally {
    console.info("Calendly - Retrieving booking modal details block executed");
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
