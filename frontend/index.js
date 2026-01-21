//Selecting the HTML elements
const customerForm = document.getElementById("customer-form");
const formStatus = document.getElementById("form-status");

//defining what happens when the form is submitted
customerForm.addEventListener("submit", async (event) => {
  //stops the page from refreshing by default on submit
  event.preventDefault();
  //displays message
  formStatus.textContent = "Saving customer details...";

  //pulls all the info from the form in pairs, eg [firstname, Jane]
  const formData = new FormData(customerForm);
  //formData.entries converts the form data into an array of pairs. Object.fromEntries converts the array into an object
  const payload = Object.fromEntries(formData.entries());

  //try/catch will catch any errors if the fetch fails
  try {
    //fetch is async, must use await otherwise response will be undefined. /submit matches our express route defined in server.js. Defines the request type (post) and that the browser is sending data in json format
    const response = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    //if there was an error, display the error message
    if (!response.ok) {
      const error = await response.json();
      formStatus.textContent = error.error || "Unable to save customer details.";
      return;
    }

    //if request was succesful, store the customer name and id for the session.
    const data = await response.json();
    sessionStorage.setItem("customerId", data.id);
    sessionStorage.setItem("customerName", `${payload.first_name} ${payload.last_name}`);

    //open the tickets page and add the customer id into the url
    window.location.href = `tickets.html?customerId=${encodeURIComponent(data.id)}`;
  } catch (err) {
    formStatus.textContent = "Unable to reach the server. Please try again.";
  }
});
