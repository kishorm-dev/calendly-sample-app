let client;

init();
const scheduleMeeting = document.getElementById("schedule-meeting");
const listEvents = document.getElementById("list-events");

let [userDetails, contactDetails] = [];
async function onAppActiveHandler() {
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
    console.log(userDetails, contactDetails);
  } catch (error) {
    console.log(error);
  }
}

async function init() {
  client = await app.initialized();
  client.events.on("app.activated", onAppActiveHandler);
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
      let data = event.helper.getData();
      console.log(data);
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
      data: userDetails,
    });
  } catch (error) {
    console.error(error);
  }
}
