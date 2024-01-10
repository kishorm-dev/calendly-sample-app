document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

let [userDetails, contactDetails] = [];

const scheduleMeeting = document.getElementById("schedule-meeting");
const listEvents = document.getElementById("list-events");

async function init() {
  try {
    // Initialize the app.
    window.client = await app.initialized();

    scheduleMeeting.setAttribute("loading", true);
    listEvents.setAttribute("loading", true);

    // Retrieve the user and contact details
    [userDetails, contactDetails] = await Promise.all([
      getUser(),
      getContact(),
    ]);

    scheduleMeeting.removeAttribute("loading");
    listEvents.removeAttribute("loading");

    scheduleMeeting.addEventListener("click", () => {
      openBookingModal();
    });
    listEvents.addEventListener("click", () => {
      openListEventsModal();
    });
  } catch (error) {
    console.error("Calendly - Error while initializing app - ", error);
  } finally {
    console.info("Calendly - App initializing block executed");
  }
}

function openBookingModal() {
  try {
    client.interface.trigger("showModal", {
      title: "Book Event",
      template: "./views/booking.html",
      data: {
        userDetails,
        contactDetails,
      },
    });
  } catch (error) {
    console.error("Calendly - Error while opening booking modal - ", error);
  } finally {
    console.info("Calendly - Opening booking modal block executed");
  }
}

function openListEventsModal() {
  try {
    client.interface.trigger("showModal", {
      title: "List Events",
      template: "./views/list-events.html",
      data: {
        userDetails,
        contactDetails,
      },
    });
  } catch (error) {
    console.error("Calendly - Error while opening list events modal - ", error);
  } finally {
    console.info("Calendly - Opening list event modal block executed");
  }
}
