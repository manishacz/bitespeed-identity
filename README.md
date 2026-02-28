# Bitespeed Identity Reconciliation Task Submission

## Live Endpoint
https://bitespeed-identity-br9f.onrender.com/identify

## Tech Stack
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- Hosted on Render

## How to Test
POST /identify

Request:
{
  "email": "test@example.com",
  "phoneNumber": "123456"
}

## Local Setup
1. Clone the repo
2. npm install
3. Create .env and add DATABASE_URL
4. npm run dev