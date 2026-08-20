# Facility Booking System

## Project Overview
A full-stack, responsive web application designed for managing weekend-only facility rentals. The system provides a seamless multi-step booking experience, enabling users to reserve various facilities (such as swimming pools, tennis courts, and sports fields) strictly during weekend morning hours (8:00 AM - 12:00 PM). It securely processes reservations, dynamically calculates promotional weekend pricing, and rigorously prevents overbooking.

## System Architecture & Tech Stack
* **Backend:** Python and Flask - Provides a lightweight, high-performance RESTful API.
* **Database:** SQLite - A self-contained, serverless database engine for handling relational booking data seamlessly without complex standalone database configurations.
* **Frontend:** Vanilla HTML5, CSS3, and JavaScript (ES6) - Features a high-fidelity, accessible Single Page Application (SPA) experience built with **zero external frontend dependencies**. This guarantees a lightweight, highly performant UI that is fully responsive and screen-reader friendly.

## Key Technical Implementations
The architecture emphasizes data integrity, concurrency management, and security, utilizing several advanced implementations:
* **Concurrency & Race Condition Prevention:** Integrates a robust `BEGIN EXCLUSIVE` SQLite transaction block in the booking API endpoint. This enforces strict write-locks to serialize concurrent network requests, gracefully handling simultaneous booking attempts and mitigating Time-of-Check to Time-of-Use (TOC-TOU) vulnerabilities.
* **Strict Timezone Enforcement:** Validates timestamps and time slots using a rigid backend allowlist rather than trusting browser-provided local time math. This guarantees the operational window remains absolute across varying geographic environments.
* **Input Sanitization (Anti-XSS):** Employs a defense-in-depth security posture. The backend sanitizes all user input via Python's native `html` module prior to database insertion, while the frontend utilizes `.textContent` binding techniques to natively neutralize XSS injection payloads.
* **Robust SPA State Management:** The checkout flow relies on an asynchronous Fetch architecture. Page refreshes safely reset the application state rather than inadvertently triggering dangerous browser-level POST form resubmissions.

## Local Setup Instructions

Follow these step-by-step instructions to clone the repository and run the application locally.

**1. Clone the repository**
```bash
git clone <repository-url>
cd booking_system
```

**2. Create and activate a virtual environment**
*On Windows (PowerShell/CMD):*
```bash
python -m venv venv
.\venv\Scripts\activate
```
*On macOS/Linux:*
```bash
python3 -m venv venv
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the development server**
```bash
python app.py
```
The application will now be running at `http://127.0.0.1:5000`. The SQLite database (`booking.db`) will automatically initialize and become ready to accept reservations upon launch.
