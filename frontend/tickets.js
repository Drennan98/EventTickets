const eventTypeSelect = document.getElementById("event-type");
const eventSelect = document.getElementById("event");
const orderForm = document.getElementById("order-form");
const orderStatus = document.getElementById("order-status");
const customerBanner = document.getElementById("customer-banner");
const summarySection = document.getElementById("order-summary");
const summaryGrid = document.getElementById("summary-grid");
const summaryTotal = document.getElementById("summary-total");

const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get("customerId") || sessionStorage.getItem("customerId");
const customerName = sessionStorage.getItem("customerName");

if (customerName) {
  customerBanner.textContent = `Ordering tickets for ${customerName}.`;
} else {
  customerBanner.textContent = "Ordering tickets for new customer.";
}

if (!customerId) {
  orderStatus.textContent = "No customer found. Please return to the customer form.";
  orderForm.querySelector("button").disabled = true;
}

const formatMoney = (value) => `€${Number(value).toFixed(2)}`;

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

    eventSelect.disabled = events.length === 0;
    if (events.length === 0) {
      orderStatus.textContent = "No events available for that type.";
    } else {
      orderStatus.textContent = "";
    }
  } catch (err) {
    orderStatus.textContent = "Unable to load events.";
  }
};

eventTypeSelect.addEventListener("change", (event) => {
  loadEvents(event.target.value);
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  orderStatus.textContent = "Submitting order...";

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

    if (!response.ok) {
      const error = await response.json();
      orderStatus.textContent = error.error || "Unable to submit order.";
      return;
    }

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

loadEventTypes();
