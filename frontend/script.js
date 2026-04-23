const API = "http://localhost:5000";

let selectedTime = "";

// Load slots on start
window.onload = generateSlots;

// Generate time slots
function generateSlots() {
    const slotsDiv = document.getElementById("slots");
    slotsDiv.innerHTML = "";
    selectedTime = "";

    for (let i = 9; i <= 21; i++) {
        let slot = document.createElement("div");
        slot.innerText = i + ":00";
        slot.className = "slot";

        slot.onclick = function () {
            document.querySelectorAll(".slot").forEach(s => s.classList.remove("active"));
            this.classList.add("active");
            selectedTime = this.innerText;
        };

        slotsDiv.appendChild(slot);
    }

    loadBookings();
}

// Get payment
function getPayment() {
    const radios = document.getElementsByName("pay");
    for (let r of radios) {
        if (r.checked) return r.value;
    }
    return "";
}

// Book appointment
function book() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const payment = getPayment();

    if (!name || !email || !date || !selectedTime || !payment) {
        alert("Please fill all fields");
        return;
    }

    fetch(API + "/book", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, date, time: selectedTime, payment })
    })
    .then(res => {
        if (!res.ok) throw new Error("Slot already booked");
        return res.text();
    })
    .then(msg => {
        alert(msg);

        // Reset form (FIXED — no null error)
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("date").value = "";
        selectedTime = "";

        document.querySelectorAll(".slot").forEach(s => s.classList.remove("active"));
        document.getElementsByName("pay").forEach(r => r.checked = false);

        loadBookings();
    })
    .catch(err => alert(err.message));
}

// Load bookings
function loadBookings() {
    const selectedDate = document.getElementById("date").value;

    if (!selectedDate) {
        document.getElementById("list").innerHTML = "";
        return;
    }

    fetch(API + "/bookings")
    .then(res => res.json())
    .then(data => {

        const filtered = data.filter(b => b.date === selectedDate);

        let html = "";

        if (filtered.length === 0) {
            html = `<p style="color:gray;">No bookings for this date</p>`;
        } else {
            filtered.forEach(b => {
                html += `
                <div class="booking">
                    <strong>${b.name}</strong><br>
                    ${b.time} • ${b.payment}
                </div>`;
            });
        }

        document.getElementById("list").innerHTML = html;
    });
}

// Reload bookings on date change
document.getElementById("date").addEventListener("change", loadBookings);