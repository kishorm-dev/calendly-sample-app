document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

const contactListInp = document.getElementById("contact-list");
async function init() {
  try {
    window.client = await app.initialized();
    const { userDetails, contactDetails } = await getData();

    let prefillData = {
      name: contactDetails.name,
      email: contactDetails.email,
    };

    if (client.context.product === "freshworks_crm") {
      document.getElementById("booking-loader")?.remove();
      await showContactSelect();
      document
        .querySelector("#book-event")
        .addEventListener("fwClick", async () => {
          prefillData = {
            name: `${contactDetails.first_name} ${contactDetails.last_name}`,
            email: contactDetails.email,
          };
          document.querySelector(".contact-list-wrapper").remove();
          await initializeCalendlyWidget(userDetails, prefillData);
        });
    } else {
      document.querySelector(".contact-list-wrapper").remove();
      await initializeCalendlyWidget(userDetails, prefillData);
    }
  } catch (error) {
    console.error("Calendly - Error while initializing app - ", error);
  } finally {
    console.info("Calendly - App initializing block executed in booking modal");
  }
}

async function initializeCalendlyWidget(userDetails, prefillData) {
  const widgetUrl =
    client.context.product === "freshworks_crm"
      ? `https://calendly.com/${
          userDetails.slug
        }?guests=${contactListInp.value.join(",")}`
      : `https://calendly.com/${userDetails.slug}`;

  Calendly.initInlineWidget({
    url: widgetUrl,
    prefill: prefillData,
  });
}

async function showContactSelect() {
  let contactList = await getDealContact();
  contactList = contactList.map((x) => {
    return {
      text: x.display_name,
      subText: x.email,
      value: x.email,
      graphicsProps: { image: x.avatar },
    };
  });
  contactListInp.options = contactList;
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
