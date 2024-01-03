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
    if (client.context.product == "freshchat") {
      contactDetails = await client.data.get("user");
      contactDetails = contactDetails.user;
    } else if (client.context.product == "freshworks_crm") {
      contactDetails = await getDealContact();
      contactDetails = contactDetails.contacts[0];
    } else if (client.context.product == "freshservice") {
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

async function getDealContact() {
  try {
    let eventDetail = await client.request.invokeTemplate("getDealContact", {});
    console.log(eventDetail);
    eventDetail = JSON.parse(eventDetail.response);
    console.log(eventDetail);
    return eventDetail;
  } catch (error) {
    showError(error);
  }
}

function showToast(type, content) {
  document.querySelector("#type_toast").trigger({ type, content });
}

function showError(error) {
  switch (error.status) {
    case 400:
      showToast("error", "Request is not Valid");
      break;
    case 401:
      showToast("error", "Invalid Authentication, Try Re-authorizing the app");
      break;
    case 403:
      showToast("error", "Permission Denied");
      break;
    case 404:
      showToast("error", "Requested resource not found");
      break;
    case 405:
      showToast("error", "An error has occurred on the server");
      break;
    default:
      showToast("error", "Unknown error occured. Please try again");
      break;
  }
  console.error("Error Occured :", error);
}
