document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

const scheduleMeeting = document.getElementById("schedule-meeting");
const listEvents = document.getElementById("list-events");

let [userDetails, contactDetails] = [];

async function init() {
  window.client = await app.initialized();
  try {
    scheduleMeeting.setAttribute("loading", true);
    listEvents.setAttribute("loading", true);
    [userDetails, contactDetails] = await Promise.all([
      getUser(),
      getContact(),
    ]);
    scheduleMeeting.removeAttribute("loading");
    listEvents.removeAttribute("loading");
    scheduleMeeting.addEventListener("click", async () => {
      await openBookingModal();
    });

    listEvents.addEventListener("click", async () => {
      openListEventsModal();
    });
  } catch (error) {
    console.error(error);
  }
}

async function openBookingModal() {
  try {
    client.interface.trigger("showModal", {
      title: "Book Event",
      template: "./views/booking.html",
      data: {
        userDetails,
        contactDetails,
      },
    });
    client.instance.receive(function (event) {
      event.helper.getData();
      showNotification("info", "Event Link Copied to Clipboard!");
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
}
