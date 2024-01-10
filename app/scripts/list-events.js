document.onreadystatechange = function () {
  if (document.readyState === "complete") init();
};

let userDetails = {},
  contactDetails = {};

const applyChanges = document.getElementById("apply-changes");
const rangePicker = document.getElementById("range-picker");
const eventsSort = document.getElementById("events-sort");
const eventsStatus = document.getElementById("events-status");

async function init() {
  try {
    window.client = await app.initialized();
    const data = await getModalData();
    userDetails = data.userDetails;
    contactDetails = data.contactDetails;
    getEventDatas("&sort=start_time:desc");
  } catch (error) {
    console.error("Calendly - Error while initializing app - ", error);
  } finally {
    console.info(
      "Calendly - App initializing block executed in list events modal"
    );
  }
}

async function getModalData() {
  try {
    let modalData = await client.instance.context();
    client.instance.resize({ height: "100vh" });
    return modalData.data;
  } catch (error) {
    console.error("Calendly - Error retrieving data from modal - ", error);
  } finally {
    console.info("Calendly - Retrieving list events data block executed");
  }
}

function getISODate(date) {
  return date.split("-").reverse().join("-");
}

async function cancelEvent(url, index) {
  const newUrl = new URL(url);
  let cancelUrl = newUrl.pathname.split("/");
  cancelUrl = cancelUrl[cancelUrl.length - 1];
  const cancelModal = document.querySelector("#cancel-event");
  const cancelReason = document.querySelector("#cancel-reason");
  const cancelFooter = document.querySelector("#cancel-footer");
  cancelModal.open();
  cancelReason.value = "";
  cancelModal.addEventListener("fwSubmit", async () => {
    cancelFooter.setAttribute("submit-disabled", true);
    await deleteEvent(cancelUrl, cancelReason.value);
    showToast("info", "Event Canceled Successfully");
    cancelFooter.setAttribute("submit-disabled", false);
    cancelReason.value = "";
    document
      .querySelector(`[data-event-id='${index}'] .event-methods`)
      ?.remove();
    cancelModal.close();
  });
}

function rescheduleEvent(url) {
  try {
    window.open(url, "_blank");
    client.instance.close();
  } catch (error) {
    console.error("Calendly - Error while rescheduling - ", error);
  }
}

applyChanges.addEventListener("fwClick", async () => {
  applyChanges.setAttribute("loading", true);
  let sort = eventsSort.value;
  let query = `&sort=start_time:${sort}`;
  if (rangePicker.fromDate != undefined && rangePicker.toDate != undefined) {
    let fromDate = getISODate(rangePicker?.fromDate);
    let toDate = getISODate(rangePicker?.toDate);
    query += `&min_start_time=${fromDate}&max_start_time=${toDate}`;
  }
  if (eventsStatus.value !== "all") {
    query += `&status=${eventsStatus.value}`;
  }
  await getEventDatas(query);
  showToast("success", "Events updated Successfully");
  applyChanges.removeAttribute("loading");
});

function getUUID(uri) {
  let url = new URL(uri);
  let arr = url.pathname.split("/");
  url = arr[arr.length - 1];
  return url;
}

async function renderEvents(eventList) {
  const eventsWrapper = document.querySelector(".events-body");
  if (eventList?.length < 1) {
    eventsWrapper.innerHTML =
      "<div class='fw-type-h3'>No Results Found...</div>";
    return;
  }
  eventsWrapper.innerHTML = "";
  eventList?.map((event, index) => {
    const accordion = document.createElement("fw-accordion");
    accordion.setAttribute("type", "default");
    accordion.setAttribute("data-event-id", index);
    const accordionTitle = document.createElement("fw-accordion-title");
    const formatDate = document.createElement("fw-format-date");
    formatDate.setAttribute("date", event.start_time);
    formatDate.setAttribute("month", "long");
    formatDate.setAttribute("day", "numeric");
    formatDate.setAttribute("year", "numeric");
    formatDate.setAttribute("hour", "numeric");
    formatDate.setAttribute("minute", "numeric");
    formatDate.setAttribute("hour-format", "12");
    const skeleton = document.createElement("fw-skeleton");
    skeleton.setAttribute("variant", "rect");
    skeleton.setAttribute("count", "6");
    skeleton.setAttribute("height", "30px");
    accordionTitle.textContent = event.name + ", ";
    accordionTitle.append(formatDate);
    const accordionBody = document.createElement("fw-accordion-body");
    accordionBody.appendChild(skeleton);
    accordionBody.setAttribute("type", "default");
    let uri = getUUID(event.uri);
    accordion.addEventListener("fwAccordionToggle", async () => {
      if (accordion.getAttribute("expanded") == null) {
        const eventDetail = await getEventData(uri);
        renderEventBody(accordionBody, event, eventDetail, index);
        skeleton.remove();
      }
    });
    accordion.appendChild(accordionTitle);
    accordion.appendChild(accordionBody);
    eventsWrapper.appendChild(accordion);
  });
}

function renderEventBody(body, event, eventDetail, index) {
  body.innerHTML = `<div class="event-row">
    <div class="fw-type-bold">Meeting Host :</div>
    <fw-label
      value="${event.event_memberships[0].user_email}"
      color="blue"
    ></fw-label>
  </div>
  <div class="event-row">
    <div class="fw-type-bold">Guest :</div>
    <fw-label
      value="${eventDetail.email}"
      color="blue"
    ></fw-label>
  </div>
  <div class="event-row">
    <div class="fw-type-bold">Meeting Location :</div>
    ${
      event.location.join_url != undefined
        ? `<a
    class="fw-type-anchor"
    target="_blank"
    href="${event.location.join_url}"
    >Join Now</a
  >`
        : `<span> No Location Details Found</span>`
    }
    
  </div>
  <div class="event-row">
    <div class="fw-type-bold">Meeting Start Time :</div>
    <fw-format-date
      date="${event.start_time}"
      hour="numeric"
      minute="numeric"
      hour-format="12"
    ></fw-format-date>
  </div>
  <div class="event-row">
    <div class="fw-type-bold">Meeting End Time :</div>
    <fw-format-date
      date="${event.end_time}"
      hour="numeric"
      minute="numeric"
      hour-format="12"
    ></fw-format-date>
  </div>`;
  let eventEndTime = new Date(event.end_time);
  let today = new Date();
  if (eventEndTime > today && eventDetail.status == "active") {
    body.innerHTML += `<div class="event-methods">
    <fw-tooltip content="You will be redirected to rescheduling page">
      <fw-button color="primary" onClick="rescheduleEvent('${eventDetail.reschedule_url}')"> Reschedule Event </fw-button>
      </fw-tooltip>
      <fw-tooltip content="Cancel event">
        <fw-button color="danger" size="icon"
        onClick="cancelEvent('${eventDetail.event}',${index})">
          <fw-icon slot="before-label" name="delete"></fw-icon>
        </fw-button>
      </fw-tooltip>
    </div>`;
  }
  return body;
}

async function getEventDatas(query) {
  const { collection } = await getEvents(
    userDetails.uri,
    query,
    contactDetails.email
  );
  renderEvents(collection);
}
