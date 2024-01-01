let client;

init();
const scheduleMeeting = document.getElementById("schedule-meeting");
const listEvents = document.getElementById("list-events");

let [userDetails, contactDetails] = [];
async function onAppActiveHandler() {
  try {
    [userDetails, contactDetails] = await Promise.all([
      getUser(),
      getContact(),
    ]);
    scheduleMeeting.addEventListener("click", async () => {
      scheduleMeeting.setAttribute("loading", true);
      await openBookingModal();
      scheduleMeeting.removeAttribute("loading");
    });

    listEvents.addEventListener("click", async () => {
      listEvents.setAttribute("loading", true);
      await openListEventsModal();
      listEvents.removeAttribute("loading");
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
    let data = client.interface.trigger("showModal", {
      title: "List Events",
      template: "./views/list-events.html",
      data: userDetails,
    });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
