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
    console.log(client.context.product);
    if (client.context.product == "freshchat") {
      contactDetails = await client.data.get("user");
      contactDetails = contactDetails.user;
    } else if (client.context.product == "freshworks_crm") {
      let { deal } = await client.data.get("deal");
      console.log(await client.data.get("currentHost"));
      console.log(deal);
      let dealId = deal.id;
      contactDetails = await getDealContact(dealId);
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
    console.error("Calendly - Error retrieving contact data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching contact details block executed");
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
    console.error("Calendly - Error retrieving events data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching event list block executed");
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
    console.error(
      "Calendly - Error retrieving paginated events data - ",
      error
    );
    showError(error);
  } finally {
    console.info("Calendly - Fetching paginated events block executed");
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
    console.error("Calendly - Error retrieving event data - ", error);
    showError(error);
  } finally {
    console.info("Calendly - Fetching event details block executed");
  }
}

async function getDealContact(dealId) {
  console.log(dealId);
  try {
    let eventDetail = await client.request.invokeTemplate("getDealContact", {
      context: {
        deal_id: dealId,
      },
    });
    console.log(eventDetail);
    eventDetail = JSON.parse(eventDetail.response);
    console.log(eventDetail);
    return eventDetail;
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
