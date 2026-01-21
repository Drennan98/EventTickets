/**
 * Elements in the DOM. 
 * Grab all required elements from the page so we can update the UI and respond to user actions.
 */

const eventTypeSelect = document.getElementById("event-type");
const eventSelect = document.getElementById("event");
const orderForm = document.getElementById("order-form");
const orderStatus = document.getElementById("order-status");
const customerBanner = document.getElementById("customer-banner");
const summarySection = document.getElementById("order-summary");
const summaryGrid = document.getElementById("summary-grid");
const summaryTotal = document.getElementById("summary-total");


/**
 * Retrieve customer details either from the URL (if redirected from another page) or sessionStorage. 
 */

const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get("customerId") || sessionStorage.getItem("customerId");
const customerName = sessionStorage.getItem("customerName");


/**
 * Display a banner message about the customer placing the order. This will say if customer is old or new.
 */

if (customerName) {
  customerBanner.textContent = `Ordering tickets for ${customerName}.`;
} else {
  customerBanner.textContent = "Ordering tickets for new customer.";
}

/**
 * If no customer ID exists, disable the form and inform the user they must return to customer page.
 */
if (!customerId) {
  orderStatus.textContent = "No customer found. Please return to the customer form.";
  orderForm.querySelector("button").disabled = true;
}


/** 
* Turn numeric value into currency.  
*/
const formatMoney = (value) => `€${Number(value).toFixed(2)}`;

/**
 * Fetch all event types from the backend and populate event type dropdown.
 */
const loadEventTypes = async () => {
  try {
    const response = await fetch("/event-types");
    const types = await response.json();

    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.event_type;
      eventTypeSelect.appendChild(option);
    });
  } catch (err) {
    orderStatus.textContent = "Unable to load event types.";
  }
};

/**
 * Fetch events for a selected event type and populate the event dropdown. 
 */
const loadEvents = async (eventTypeId) => {
  eventSelect.innerHTML = "<option value=\"\">Choose an event</option>";
  eventSelect.disabled = true;

  if (!eventTypeId) {
    return;
  }

  try {
    const response = await fetch(`/events?eventTypeId=${encodeURIComponent(eventTypeId)}`);
    const events = await response.json();

    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = `${event.event_name} | ${event.event_date} ${event.event_time} | ${event.location} | ${formatMoney(event.price)}`;
      eventSelect.appendChild(option);
    });

    // Enable dropdown only if events exist.
    eventSelect.disabled = events.length === 0;

    // User feedback if no events are found.
    if (events.length === 0) {
      orderStatus.textContent = "No events available for that type.";
    } else {
      orderStatus.textContent = "";
    }
  } catch (err) {
    orderStatus.textContent = "Unable to load events.";
  }
};

/**
 * When the type changes, load the corresponding events dynamically. 
 */
eventTypeSelect.addEventListener("change", (event) => {
  loadEvents(event.target.value);
});

/**
 * Form handling submission, send order to backend and display order summary.
 */
orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  orderStatus.textContent = "Submitting order...";


  /**
   * Payload sent to backend to create order. 
   */
  const payload = {
    customer_id: customerId,
    event_id: eventSelect.value,
    quantity: document.getElementById("quantity").value,
  };

  try {
    const response = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    /**
     * Handle backend validation or server errors. 
     */
    if (!response.ok) {
      const error = await response.json();
      orderStatus.textContent = error.error || "Unable to submit order.";
      return;
    }

    // Display order summary. 
    const data = await response.json();
    const summary = data.summary;

    summaryGrid.innerHTML = "";
    const items = [
      ["Customer", `${summary.customer.first_name} ${summary.customer.last_name}`],
      ["Email", summary.customer.email],
      ["Event type", summary.event.type],
      ["Event", summary.event.name],
      ["When", `${summary.event.date} ${summary.event.time}`],
      ["Location", summary.event.location],
      ["Tickets", summary.quantity],
      ["Price per ticket", formatMoney(summary.event.price)],
    ];

    // Render each summary row. 
    items.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      summaryGrid.appendChild(row);
    });

    summaryTotal.textContent = `Total: ${formatMoney(summary.total)}`;
    summarySection.hidden = false;
    orderStatus.textContent = "Order complete.";
  } catch (err) {
    orderStatus.textContent = "Unable to submit order.";
  }
});

// Populate event types on initial load.
loadEventTypes();
