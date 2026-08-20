# Facility Booking System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-black.svg)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-lightgrey.svg)](https://www.sqlite.org/)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-yellow.svg)]()

## Project Overview

A full-stack, responsive web application designed for managing weekend-only facility rentals. The system provides a seamless multi-step booking experience, enabling users to reserve various facilities (such as swimming pools, tennis courts, and sports fields) strictly during weekend morning hours (8:00 AM - 12:00 PM). It securely processes reservations, dynamically calculates promotional weekend pricing, and rigorously prevents overbooking.

## System Architecture & Tech Stack

* **Backend (Python / Flask):** Provides a lightweight, high-performance RESTful API.
* **Database (SQLite):** A self-contained, serverless database engine for seamlessly handling relational booking data without complex standalone database configurations.
* **Frontend (Vanilla HTML5 / CSS3 / ES6):** Features a high-fidelity, accessible Single Page Application (SPA) experience built with **zero external frontend dependencies**. This guarantees a lightweight, highly performant UI that is fully responsive and screen-reader friendly.

## Key Technical Implementations

The architecture emphasizes data integrity, concurrency management, and security, utilizing several advanced implementations:

* **Concurrency & Race Condition Prevention:** Integrates a robust `BEGIN EXCLUSIVE` SQLite transaction block in the booking API endpoint. This enforces strict write-locks to serialize concurrent network requests, gracefully handling simultaneous booking attempts and mitigating Time-of-Check to Time-of-Use (TOC-TOU) vulnerabilities.
* **Strict Timezone Enforcement:** Validates timestamps and time slots using a rigid backend allowlist rather than trusting browser-provided local time math. This guarantees the operational window remains absolute across varying geographic environments.
* **Input Sanitization (Anti-XSS):** Employs a defense-in-depth security posture. The backend sanitizes all user input via Python's native `html` module prior to database insertion, while the frontend utilizes `.textContent` binding techniques to natively neutralize Cross-Site Scripting (XSS) injection payloads.
* **SPA State Management:** The checkout flow relies on an asynchronous Fetch architecture. Page refreshes safely reset the application state rather than inadvertently triggering dangerous browser-level POST form resubmissions.

## Local Setup Instructions

Follow these step-by-step instructions to clone the repository and run the application locally.

**1. Clone the repository**
```bash
git clone https://github.com/rozin-not-found/facility-booking-system.git
cd facility-booking-system
```

**2. Create and activate a virtual environment**
On Windows (PowerShell/CMD): 
```bash
python -m venv venv
.\venv\Scripts\activate
```
On macOS/Linux:
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
---
# Demo

<img width="811" height="552" alt="Screenshot 2026-08-20 183931" src="https://github.com/user-attachments/assets/5dffcb18-423c-4977-9b84-e31f178fb2f5" />

<img width="827" height="875" alt="image" src="https://github.com/user-attachments/assets/06cae7ad-def0-4fd2-902c-cef4317a2e90" />

<img width="822" height="570" alt="image" src="https://github.com/user-attachments/assets/0173892a-5d56-489f-85ed-7fe347d91652" />

<img width="814" height="780" alt="image" src="https://github.com/user-attachments/assets/92649bcc-d88e-4037-81e4-6851a804c2de" />

<img width="810" height="480" alt="image" src="https://github.com/user-attachments/assets/9c205bc1-a948-422f-8a6d-0fb19a14e2f8" />





