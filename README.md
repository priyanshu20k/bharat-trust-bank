
🏦 Bharat Trust Bank


A Next-Generation Full-Stack MERN Digital Banking Platform


📖 Overview

Bharat Trust Bank is a secure, high-performance digital banking simulator built with pure modern JavaScript (ES Modules). The application replicates a real-world online banking ecosystem, empowering users to execute instant UPI transfers, manage digital insurance policies, calculate loan EMIs interactively, and track an immutable transaction ledger.

⚡ Key Features

• Executive Banking Dashboard
Get real-time visibility into your financial health. Monitor primary savings balances, analyze total inflows, and track active liabilities from a single, unified view.
• Instant UPI & QR Center
Execute peer-to-peer UPI transfers instantly. Features dynamic QR code generation and a 12-digit UTR (Unique Transaction Reference) settlement tracking system.
• Interactive Loans & EMI Calculator
Plan your finances using dynamic sliders to calculate EMIs for personal and home loans. Features an auto-approved ledger disbursement simulation.
• Insurance Protection Desk
Secure your future with one-click cashless claim submissions and integrated monthly premium auto-debits.
• Resilient Dual-Mode Database Engine
Built for maximum uptime. The application automatically defaults to a custom in-memory document store for local development and smoothly scales to a native MongoDB cluster in production.

🛠️ Tech Stack


Frontend

• React 19 & Vite (Next-gen frontend tooling)
• Tailwind CSS v4 (Utility-first styling)
• Lucide React (Crisp iconography)
• Axios (Promise-based HTTP client)

Backend & Database

• Node.js (v18+) & Express.js
• MongoDB (Native mongodb Driver v7)

Architecture

• Unified Single-Port Runtime (Express serving Vite middleware directly on a single port)

🚀 Setup & Installation


1. Clone the Workspace

bash
git clone https://github.com/priyanshu20k/bharat-trust-bank.git
cd "Bharat Trust Bank"
Use code with caution.

2. Install Dependencies

bash
# Set up the Backend
cd server
npm install

# Set up the Frontend
cd ../client
npm install
Use code with caution.

3. Configure the Environment

Create a .env file inside the server/ directory and add the following configuration:
env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bharat-trust-bank
Use code with caution.

💻 Running the Application

1. Database Check: Ensure your local MongoDB instance (or MongoDB Compass) is running on port 27017. (Note: The application will automatically fall back to an in-memory database if MongoDB is unreachable).
2. Start the Server: Open a terminal in the server/ directory and run:bash
npm run dev
Use code with caution.
3. Launch: Open http://localhost:5000 in your browser to experience the platform.

🤖 AI Development Journey (Powered by Kiro)

This platform was built in close collaboration with Kiro, serving as an embedded, context-aware architectural assistant.

Development Impact

Kiro accelerated the codebase lifecycle by maintaining strict architectural alignment between the React frontend and the Express backend. By handling boilerplate generation and analyzing terminal error logs, it allowed for an exclusive focus on core banking logic, database resilience, and user experience.

Specific AI-Assisted Milestones

• Component Engineering: Co-designed LoansView.jsx and UpiPaymentView.jsx, integrating complex mathematical EMI formulas with highly responsive Tailwind CSS layouts.
• API Scaffolding: Built standardized RESTful endpoints in server/routes/bankingRoutes.js featuring clean JSON payloads and proper HTTP status codes.
• Resilience Engineering: Programmed the dual-mode database engine in server/db/mongo.js, preventing server crashes through automated in-memory degradation when MongoDB goes offline.
• Runtime Consolidation: Resolved a critical EADDRINUSE port 3000 conflict by integrating Vite directly into Express middleware (vite.middlewares), unifying the stack onto a single port.
• Modernization: Migrated legacy TypeScript files into pure JavaScript ES Modules ("type": "module"), resolving import path discrepancies and cleaning up stale dependencies.
Would you like me to help you create a GitHub README version with copyable code blocks, or format a slide presentation outline based on this project?
