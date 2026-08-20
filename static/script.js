let bookingData = { date: '', time_slot: '', facility_id: '', facility_name: '', base_price: 0, discounted_price: 0, name: '', email: '' };

document.addEventListener('DOMContentLoaded', () => {
    // Dynamically set min date to today in local timezone
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('booking-date').min = `${yyyy}-${mm}-${dd}`;
});

function goToStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
}

function checkAvailability() {
    const dateInput = document.getElementById('booking-date').value;
    const timeInput = document.getElementById('time-slot').value;
    const errorDiv = document.getElementById('step-1-error');
    
    if (!dateInput || !timeInput) {
        errorDiv.textContent = 'Please select both a date and a time slot.';
        return;
    }

    // Client-side past date verification
    const todayStr = document.getElementById('booking-date').min;
    if (dateInput < todayStr) {
        errorDiv.textContent = 'Bookings cannot be made for past dates.';
        return;
    }

    // Ensure it's a weekend via local day checking
    const dateObj = new Date(dateInput);
    const day = dateObj.getUTCDay();
    if (day !== 0 && day !== 6) {
        errorDiv.textContent = 'Bookings are strictly available on weekends (Saturday and Sunday).';
        return;
    }

    bookingData.date = dateInput;
    bookingData.time_slot = timeInput;
    errorDiv.textContent = 'Checking availability...';
    errorDiv.style.color = '#333';

    fetch(`/api/availability?date=${dateInput}&time_slot=${timeInput}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                errorDiv.textContent = data.error;
                errorDiv.style.color = 'var(--error-red)';
                return;
            }
            errorDiv.textContent = '';
            renderFacilities(data);
            goToStep(2);
        })
        .catch(err => {
            errorDiv.textContent = 'Failed to communicate with the server.';
            errorDiv.style.color = 'var(--error-red)';
        });
}

function renderFacilities(facilities) {
    const grid = document.getElementById('facilities-list');
    grid.innerHTML = '';
    bookingData.facility_id = '';
    document.getElementById('btn-step-2-next').disabled = true;

    for (const [id, f] of Object.entries(facilities)) {
        const card = document.createElement('div');
        card.className = `facility-card ${f.available > 0 ? '' : 'disabled'}`;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        
        card.innerHTML = `
            <h3>${f.name}</h3>
            <p class="qty">Spots Available: ${f.available}</p>
            <div class="price-row">
                <span class="original-price">$${f.base_price.toFixed(2)}</span>
                <span class="discount-price">$${f.discounted_price.toFixed(2)} / hr</span>
            </div>
            <div class="discount-badge">25% Weekend Discount</div>
        `;

        if (f.available > 0) {
            card.onclick = () => selectFacility(id, f, card);
            card.tabIndex = 0; // for accessibility
            card.onkeydown = (e) => { 
                if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectFacility(id, f, card); 
                }
            };
        }

        grid.appendChild(card);
    }
}

function selectFacility(id, facility, cardElement) {
    document.querySelectorAll('.facility-card').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-pressed', 'false');
    });
    cardElement.classList.add('selected');
    cardElement.setAttribute('aria-pressed', 'true');
    
    bookingData.facility_id = id;
    bookingData.facility_name = facility.name;
    bookingData.base_price = facility.base_price;
    bookingData.discounted_price = facility.discounted_price;
    
    document.getElementById('btn-step-2-next').disabled = false;
}

function prepareSummary() {
    const nameInput = document.getElementById('user-name').value.trim();
    const emailInput = document.getElementById('user-email').value.trim();
    
    if (!nameInput || !emailInput || !document.getElementById('user-email').checkValidity()) {
        alert('Please enter a valid name and email address.');
        return;
    }

    bookingData.name = nameInput;
    bookingData.email = emailInput;

    document.getElementById('sum-name').textContent = bookingData.name;
    document.getElementById('sum-email').textContent = bookingData.email;
    document.getElementById('sum-date').textContent = bookingData.date;
    document.getElementById('sum-time').textContent = bookingData.time_slot;
    document.getElementById('sum-facility').textContent = bookingData.facility_name;
    
    document.getElementById('sum-base').textContent = bookingData.base_price.toFixed(2);
    const discountAmt = bookingData.base_price - bookingData.discounted_price;
    document.getElementById('sum-discount').textContent = discountAmt.toFixed(2);
    document.getElementById('sum-total').textContent = bookingData.discounted_price.toFixed(2);

    goToStep(4);
}

function submitBooking() {
    const errorDiv = document.getElementById('booking-error');
    const btn = document.getElementById('btn-confirm');
    
    errorDiv.textContent = '';
    btn.disabled = true; // Prevent double-clicks and rapid re-submission
    btn.textContent = 'Processing...';
    
    fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            errorDiv.textContent = data.error;
            btn.disabled = false;
            btn.textContent = 'Confirm Booking';
        } else {
            goToStep('success');
        }
    })
    .catch(err => {
        errorDiv.textContent = 'An error occurred while confirming your booking. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Confirm Booking';
    });
}
