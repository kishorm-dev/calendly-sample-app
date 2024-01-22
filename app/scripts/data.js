async function getUser() {
  try {
    let userDetails = await client.request.invokeTemplate(
      "calendlyGetUser",
      {}
    );
    userDetails = JSON.parse(userDetails.response).resource;
    return userDetails;
  } catch (error) {
    console.error("Calendly - Error retrieving user data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching user details block executed");
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
      contactDetails = contactDetails[0];
    } else if (client.context.product == "freshservice") {
      contactDetails = await client.data.get("requester");
      contactDetails = contactDetails.requester;
    } else {
      contactDetails = await client.data.get("contact");
      contactDetails = contactDetails.contact;
    }
    return contactDetails;
  } catch (error) {
    console.error("Calendly - Error retrieving contact data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching contact details block executed");
  }
}

async function getEvents(url, query, invitee_email) {
  try {
    let listEvents = await client.request.invokeTemplate(
      "calendlyListSchedules",
      {
        context: {
          user: url,
          query,
          invitee_email,
        },
      }
    );
    listEvents = JSON.parse(listEvents.response);
    return listEvents;
  } catch (error) {
    console.error("Calendly - Error retrieving events data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching event list block executed");
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
    console.error("Calendly - Error deleting event - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Delete event block executed");
  }
}

async function getEventData(url) {
  try {
    let eventDetail = await client.request.invokeTemplate(
      "calendlyEventDetails",
      {
        context: {
          uuid: url,
        },
      }
    );
    eventDetail = JSON.parse(eventDetail.response).collection;
    return eventDetail[0];
  } catch (error) {
    console.error("Calendly - Error retrieving event data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching event details block executed");
  }
}

async function getDealContact() {
  try {
    let deal = await client.data.get("currentEntityInfo");
    let eventDetail = await client.request.invokeTemplate("getDealContact", {
      context: {
        deal_id: deal["currentEntityInfo"]["currentEntityId"],
      },
    });
    eventDetail = JSON.parse(eventDetail.response);
    return eventDetail["contacts"];
  } catch (error) {
    console.error("Calendly - Error retrieving deals contact data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching deals contact detail block executed");
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
      showToast("error", "Unknown error occured. Please try again later");
      break;
  }
}
