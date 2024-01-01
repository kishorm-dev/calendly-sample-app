let client;

init();

let userDetails;
let query = "&sort=start_time:desc";
async function init() {
  client = await app.initialized();
  renderWidget();
}
const rangePicker = document.getElementById("range-picker");
const eventsSort = document.getElementById("events-sort");
rangePicker.addEventListener("fwChange", (e) => {
  let fromDate = e.detail.value.fromDate;
  let toDate = e.detail.value.toDate;
  query += `&min_start_time=${fromDate}`;
  console.log(toDate);
  renderAll(query);
});
eventsSort.addEventListener("fwDateInput", (e) => {
  query = `&sort=start_time:${e.detail.value}`;
  renderAll(query);
});
function setDate() {
  const today = new Date();
  const minYear = today.getFullYear();
  const maxYear = today.getFullYear() + 10;
  const minDate =
    minYear + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const maxDate =
    maxYear + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  rangePicker.setAttribute("min-year", minYear);
  rangePicker.setAttribute("max-year", maxYear);
  rangePicker.setAttribute("min-date", minDate);
  rangePicker.setAttribute("max-date", maxDate);
}

// async function generateRangeQuery(uri, date) {
//   let sort = eventsSort.getAttribute("value");
//   let query = `&sort=start_time:${sort}&min_start_time=${date.fromDate}&max_start_time=${date.toDate}`;

//   try {
//     const events = await getEvents(uri, query);
//     console.log(events);
//     renderEvents(collection);
//     renderPagination(pagination);
//   } catch (error) {
//     console.error(error);
//   }
// }

async function renderWidget() {
  userDetails = await getModalData();
  console.log(userDetails);
  renderAll(query);
}

async function getModalData() {
  try {
    let modalData = await client.instance.context();
    client.instance.resize({ height: "100vh" });
    return modalData.data;
  } catch (error) {
    console.error(error);
  }
}

function getUUID(uri) {
  let url = new URL(uri);
  let arr = url.pathname.split("/");
  url = arr[arr.length - 1];
  return url;
}

async function renderPagination(page) {
  if (page.previous_page_token == null && page.next_page_token == null) {
    return;
  }
  const footer = document.querySelector(".events-footer");
  footer.innerHTML = "";
  const nextPage = document.createElement("fw-button");
  const prevPage = document.createElement("fw-button");
  nextPage.textContent = "Show Next";
  prevPage.textContent = "Show Previous";
  nextPage.setAttribute("color", "secondary");
  prevPage.setAttribute("color", "secondary");
  if (page.previous_page_token != null) {
    nextPage.setAttribute("disabled", true);
    prevPage.addEventListener("click", () => {
      query += `&page_token=${page.previous_page_token}`;
      renderAll(query);
    });
  } else if (page.next_page_token != null) {
    prevPage.setAttribute("disabled", true);
    nextPage.addEventListener("click", () => {
      query += `&page_token=${page.next_page_token}`;
      renderAll(query);
    });
  }
  footer.appendChild(prevPage);
  footer.appendChild(nextPage);
}

async function renderEvents(eventList) {
  const eventsWrapper = document.querySelector(".events-body");
  eventsWrapper.innerHTML = "";
  eventList.map((event) => {
    const accordion = document.createElement("fw-accordion");
    accordion.setAttribute("type", "default");
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
        renderEventBody(accordionBody, event, eventDetail);
        skeleton.remove();
      }
    });
    accordion.appendChild(accordionTitle);
    accordion.appendChild(accordionBody);
    eventsWrapper.appendChild(accordion);
  });
}

function renderEventBody(body, event, eventDetail) {
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
  </div>

  <div class="">
    <fw-button color="primary"> Reschedule Event </fw-button>
    <fw-tooltip content="Cancel event">
      <fw-button color="danger" size="icon">
        <fw-icon slot="before-label" name="delete"></fw-icon>
      </fw-button>
    </fw-tooltip>
  </div>`;

  return body;
}

async function renderAll(query) {
  const { collection, pagination } = await getEvents(
    userDetails.uri,
    query,
    "&start_time:asc&page_token=page.previous_page_token"
  );
  renderEvents(collection);
  renderPagination(pagination);
}
