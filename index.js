// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-Karl"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
  <h3>Create New Party</h3>
  <label>Name: <input name="name" required /></label>
  <label>Description: <textarea name="description" required></textarea></label>
  <label>Date: <input name="date" type="date" required /></label>
  <label>Location: <input name="location" required /></label>
  <button type="submit">Add Party</button>
  `;
  $form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const data = {
      name: $form.name.valueOf,
      desription: $form.description.value,
      location: $form.location.value,
      data: new Date($form.date.value).toISOString(),
    };
    try {
      const response = await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new error(response.status);
      await getParties();
      $form.reset();
    } catch (error) {
      console.error("POST failed", error);
      alert("Could not create party");
    }
  });
  return $form;
}

function DeletePartyButton() {
  const $button = document.createElement("button");
  $button.textContent = "Delete Selected Party";
  $button.disabled = !selectedParty;
  $button.addEventListener("click", async () => {
    if (!selectedParty) return;
    if (!confirm("Are you sure you want to delete this party?")) return;
    try {
      const response = await fetch(`${API}/events/${selectedParty.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(response.status);
      selectedParty = undefined;
      await getParties();
      await getRsvps();
    } catch (error) {
      console.error("DELETE failed", error);
      alert("Could not delete party");
    }
  });
  return $button;
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
