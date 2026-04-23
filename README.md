# Contract / Policy Analyzer

A web app that helps users understand contracts, policies, and terms documents in plain English.

Users can paste a document into the app, generate a structured analysis, see risky clauses, and ask follow-up questions grounded in the analyzed text.

## Features

* Plain-English document summary
* Clause-by-clause breakdown
* Risk level tagging for each clause
* Overall risk overview
* Follow-up Q&A based on the analyzed clauses
* Groq-powered backend analysis

## How it works

1. A user pastes a contract, policy, lease, or terms document into the app.
2. The backend splits the text into chunks.
3. Each chunk is analyzed with Groq.
4. The app returns:

   * a summary
   * notable concerns
   * clause explanations
   * risk levels
5. The user can then ask questions about the document.

## Tech stack

* Next.js
* React
* TypeScript
* Groq API
* Zod

## Project structure

```text
app/
  api/
    analyze/
      route.ts
    ask/
      route.ts
  page.tsx
components/
  AnalyzerForm.tsx
  ClauseCard.tsx
  QABox.tsx
lib/
  analyzer.ts
```

## Environment variables

Create a `.env.local` file in the project root:

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Deployment

Before deploying, make sure your hosting platform has these environment variables set:

* `GROQ_API_KEY`
* `GROQ_MODEL`


## Notes

* This project is for informational use only.
* It is not legal advice.
* The quality of the answers depends on the pasted document text and model output.

## Future improvements

* PDF and DOCX upload
* Highlighted evidence spans
* Better retrieval for Q&A
* Domain-specific modes for leases, employment contracts, and privacy policies
* Saved analysis history
