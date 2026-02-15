import os

file_path = "assets/js/script.js"
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

marker = "// --- Calendar Date Picker Logic ---"
idx = content.find(marker)

if idx != -1:
    new_logic = """// --- Calendar Date Picker Logic ---
const calendarDays = document.querySelectorAll('.calendar-day:not(.booked)');
const dateInput = document.getElementById('ramadan-date');

// Function to load bookings from LocalStorage (Personal Persistence)
function loadMyBookings() {
    const savedBookings = JSON.parse(localStorage.getItem('festaBookings') || '[]');
    document.querySelectorAll('.calendar-day').forEach(day => {
        const val = day.getAttribute('data-val');
        if (savedBookings.includes(val)) {
            day.classList.add('booked');
            day.classList.remove('selected');
        }
    });
}
// Load immediately
loadMyBookings();

calendarDays.forEach(day => {
    day.addEventListener('click', () => {
        if (day.classList.contains('booked')) return;
        
        // Remove active class from all
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        
        // Add active class to clicked
        day.classList.add('selected');
        
        // Update hidden input
        dateInput.value = day.getAttribute('data-val');
    });
});

// --- Booking Form → WhatsApp ---
document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    const guests = document.getElementById('guest-count').value;
    const date = document.getElementById('ramadan-date').value;
    const venue = document.querySelector('input[name="venue"]:checked');

    if (!name || !guests || !date || !venue) {
        alert('Please fill in all fields.');
        return;
    }

    // Save this booking locally
    const savedBookings = JSON.parse(localStorage.getItem('festaBookings') || '[]');
    if (!savedBookings.includes(date)) {
        savedBookings.push(date);
        localStorage.setItem('festaBookings', JSON.stringify(savedBookings));
        // Update UI
        loadMyBookings();
    }

    const message = `*Festa Ramadan Booking*

*Guest Name:* ${name}
*Party Size:* ${guests} guests
*Date:* ${date}
*Venue:* ${venue.value}

I'd like to reserve this experience. Please confirm availability.`;

    const phone = '918921479100';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});
"""
    new_content = content[:idx] + new_logic
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("JS updated successfully.")
else:
    print("Marker not found.")
