async function getUser() {
  try {
    let userDetails = await client.request.invokeTemplate(
      "calendlyGetUser",
      {}
    );
    userDetails = JSON.parse(userDetails.response).resource;
    return userDetails;
  } catch (error) {
    showError(error);
  }
}

async function getContact() {
  try {
    let contactDetails;
    if (client.context.product == "freshservice") {
      contactDetails = await client.data.get("requester");
      contactDetails = contactDetails.requester;
    } else {
      contactDetails = await client.data.get("contact");
      contactDetails = contactDetails.contact;
    }
    return contactDetails;
  } catch (error) {
    showError(error);
  }
}

async function getEvents(uri, query, invitee_email) {
  try {
    let listEvents = await client.request.invokeTemplate(
      "calendlyListSchedules",
      {
        context: {
          user: uri,
          query,
          invitee_email,
        },
      }
    );
    listEvents = JSON.parse(listEvents.response);
    return listEvents;
  } catch (error) {
    showError(error);
  }
}
async function getPagination(query) {
  try {
    let listEvents = await client.request.invokeTemplate("calendlyPagination", {
      context: {
        query,
      },
    });
    listEvents = JSON.parse(listEvents.response);
    return listEvents;
  } catch (error) {
    showError(error);
  }
}
async function deleteEvent(url, reason) {
  try {
    let listEvents = await client.request.invokeTemplate(
      "calendlyDeleteSchedule",
      {
        context: {
          uuid: url,
          reason,
        },
      }
    );
    listEvents = JSON.parse(listEvents.response);
    return listEvents;
  } catch (error) {
    showError(error);
  }
}

async function getEventData(uri) {
  try {
    let eventDetail = await client.request.invokeTemplate(
      "calendlyEventDetails",
      {
        context: {
          uuid: uri,
        },
      }
    );
    eventDetail = JSON.parse(eventDetail.response).collection;
    return eventDetail[0];
  } catch (error) {
    showError(error);
  }
}

function showError(error) {
  switch (error.status) {
    case 400:
      showNotification("info", "Request is not Valid");
      break;
    case 401:
      showNotification(
        "info",
        "Invalid Authentication, Try Re-authorizing the app"
      );
      break;
    case 403:
      showNotification("info", "Permission Denied");
      break;
    case 404:
      showNotification("info", "Requested resource not found");
      break;
    case 405:
      showNotification("info", "An error has occurred on the server");
      break;
    default:
      showNotification("info", "Unknown error occured. Please try again");
      break;
  }
  console.error(error);
}

async function showNotification(type, message) {
  try {
    await client.interface.trigger("showNotify", {
      type: type,
      message,
    });
  } catch (error) {
    console.error(error);
  }
}
async function showToast(type, content) {
  document.querySelector("#type_toast").trigger({ type, content });
}
