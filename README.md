# Bharat Trust Bank

**1. Project Name and Description**
Bharat Trust Bank is a full-stack MERN digital banking platform built with pure modern JavaScript (ES Modules). The application simulates an authentic online banking environment, allowing users to process instant UPI transfers, manage digital insurance policies, calculate loan EMIs interactively, and track real-time transaction ledgers.

**2. Features**
* **Executive Banking Dashboard:** Real-time visibility into primary savings balances, total inflows, and active liabilities.
* **Instant UPI & QR Center:** Peer-to-peer UPI transfers with dynamic QR code generation and 12-digit UTR settlement tracking.
* **Interactive Loans & EMI Calculator:** Dynamic sliders to calculate EMIs for personal and home loans, featuring auto-approved ledger disbursements.
* **Insurance Protection Desk:** One-click cashless claim submissions and monthly premium auto-debits.
* **Resilient Database Engine:** Automatically defaults to an in-memory document store for local development while scaling to a native MongoDB cluster in production.

**3. Technologies Used**
* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Axios
* **Backend:** Node.js (v18+), Express.js
* **Database:** MongoDB (Native `mongodb` Driver v7)
* **Architecture:** Unified Single-Port Runtime (Express serving Vite middleware)

**4. Setup and Installation Instructions**
1. Clone the repository:
   ```bash
   git clone [https://github.com/priyanshu20k/bharat-trust-bank.git](https://github.com/priyanshu20k/bharat-trust-bank.git)
   cd "Bharat Trust Bank"
Install the backend dependencies:

Bash
cd server
npm install
Install the frontend dependencies:

Bash
cd ../client
npm install
Configure environment variables by creating a .env file inside the server/ directory:

Code snippet
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bharat-trust-bank
5. How to Run the Application

Ensure your local MongoDB instance (or MongoDB Compass) is running on port 27017 (Optional: The application will automatically fall back to an in-memory database if MongoDB is not connected).

Open a terminal in the server directory.

Boot the unified server:

Bash
npm run dev
Open http://localhost:5000 (or the dynamically generated network link in your terminal) in your browser to launch the application.

6. AI Development Tool Used
I used Kiro (https://app.kiro.de/) as the primary AI development tool for this project.

7. AI Development Experience
Kiro acted as an embedded, context-aware collaborator that deeply understood the cross-repository workspace structure of the MERN stack. By maintaining architectural alignment between the React frontend and the Express backend, Kiro accelerated the implementation of complex REST APIs and dynamic React components. Its ability to analyze terminal error logs and instantly scaffold boilerplate allowed me to focus purely on core banking logic, database resilience, and user experience.

8. Specific Tasks Assisted by AI

Component Development: Used Kiro to rapidly design and format the LoansView.jsx and UpiPaymentView.jsx components, incorporating responsive Tailwind CSS layouts and an interactive mathematical EMI calculator.

API Creation: Scaffolded the RESTful backend endpoints in server/routes/bankingRoutes.js, ensuring standardized JSON payload responses and proper HTTP status codes for transactions and insurance claims.

Database Integration: Engineered a resilient dual-mode database engine in server/db/mongo.js that connects to MongoDB when available, but automatically degrades to a custom in-memory document store to prevent server crashes if the database goes offline.

Debugging: Rapidly diagnosed and resolved a complex EADDRINUSE port 3000 collision by guiding the integration of Vite as Express middleware (vite.middlewares), unifying the development environment onto a single port.

Refactoring: Transitioned the project's original TypeScript files into pure JavaScript ES Modules ("type": "module"), cleaning up stale dependencies and resolving import path discrepancies across the client and server.
