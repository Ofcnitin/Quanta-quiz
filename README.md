# Quanta — AI Quiz Generator

> Turn any topic or PDF into an interactive AI-powered quiz in seconds.

**Quanta** is a premium, responsive AI quiz generator designed for students, educators, self-learners, and anyone who wants to test their knowledge quickly.

🌐 **Live Web App:** https://ofcnitin.github.io/Quanta-quiz/

---

## ✨ Features

### 🧠 AI Quiz Generation
Generate high-quality multiple-choice quizzes from a simple topic using Groq's fast AI inference.

- Enter any topic
- Choose difficulty
- Select 5–25 questions
- Automatically generated questions
- Four answer choices per question
- Explanations for every answer

### 📄 PDF → Quiz
Upload a PDF and turn its content into a quiz.

- Browser-based PDF text extraction
- Up to 20 MB per PDF
- Up to 50 pages
- Content-grounded questions
- No need to manually copy and paste document text
- PDF content is processed for the current quiz session

### 🎯 Difficulty Levels

| Level | Focus |
| --- | --- |
| **Easy** | Recall, recognition, straightforward concepts |
| **Medium** | Understanding, application, inference |
| **Hard** | Analysis, synthesis, multi-step reasoning |

### 📝 Interactive Quiz Experience

- One-question-at-a-time interface
- Progress tracking
- Question navigation rail
- Answer selection
- Instant scoring
- Correct/incorrect feedback
- Detailed explanations
- Retake quizzes

### 🎨 Premium UI

Quanta uses a modern **Liquid Glass** visual system:

- Translucent glass surfaces
- Soft blur and depth
- Subtle borders
- Ambient lighting
- Restrained neon accents
- Responsive layouts
- Mobile-first interaction
- Dark cinematic interface

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│   GitHub Pages       │
│                      │
│  Quanta Web App      │
│  HTML / CSS / JS     │
└──────────┬───────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────┐
│   Cloudflare Worker  │
│                      │
│  Secure API Proxy    │
│  GROQ_API_KEY Secret │
└──────────┬───────────┘
           │
           │ API
           ▼
┌──────────────────────┐
│       Groq API       │
│                      │
│  GPT-OSS 20B         │
└──────────┬───────────┘
           │
           ▼
     Structured Quiz

The Groq API key is never exposed in the GitHub Pages frontend. It is stored as a Cloudflare Worker secret.

Groq supports structured JSON/JSON Schema outputs, which makes the generated quiz data suitable for programmatic validation and rendering. 


---

🛠️ Tech Stack

Technology	Purpose

HTML5	Application structure
CSS3	Liquid Glass UI and responsive design
JavaScript	Frontend application logic
PDF.js	Client-side PDF text extraction
Groq API	AI quiz generation
GPT-OSS 20B	Quiz generation model
Cloudflare Workers	Secure API proxy
GitHub Pages	Static web hosting
GitHub Actions	Automated deployment


GitHub Pages supports custom GitHub Actions workflows for deploying static websites, which Quanta uses for its deployment pipeline. 


---

📁 Project Structure

Quanta-quiz/
│
├── index.html
├── styles.css
├── app.js
├── README.md
│
├── worker/
│   ├── index.js
│   └── wrangler.toml
│
└── .github/
    └── workflows/
        └── pages.yml


---

🔐 Security

Quanta is designed so that the Groq API key is never placed inside the public frontend.

Browser
   │
   ▼
GitHub Pages
   │
   ▼
Cloudflare Worker
   │
   ├── GROQ_API_KEY
   │
   ▼
Groq API

The API credential remains server-side inside the Cloudflare Worker environment.

Never commit your Groq API key to GitHub.


---

🚀 Local Development

Clone the repository:

git clone https://github.com/Ofcnitin/Quanta-quiz.git
cd Quanta-quiz

Open the project locally with any static web server.

For the backend:

cd worker
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy

Then configure the deployed Worker URL in app.js.


---

🌐 Live Demo

Try Quanta now

https://ofcnitin.github.io/Quanta-quiz/

Generate a quiz from:

📚 A topic

📄 A PDF document



---

📌 Current Status

MVP — Functional

[x] Topic-based quiz generation

[x] PDF-based quiz generation

[x] Groq AI integration

[x] Difficulty selection

[x] 5–25 question selection

[x] Interactive quiz interface

[x] Answer tracking

[x] Instant scoring

[x] Answer explanations

[x] Quiz retake

[x] Responsive UI

[x] GitHub Pages deployment

[x] Secure Cloudflare API proxy

[x] PDF text extraction


Planned

[ ] True/False questions

[ ] Fill-in-the-blank questions

[ ] Timer mode

[ ] PDF quiz export

[ ] Shareable quiz links

[ ] Quiz history

[ ] Individual question regeneration

[ ] User accounts

[ ] Adaptive difficulty

[ ] Classroom mode



---

📄 License

This project is currently provided for development and educational purposes.


---

Quanta

Learn something. Generate a quiz. Test yourself.

🌐 Live: https://ofcnitin.github.io/Quanta-quiz/

I intentionally kept the README's claims aligned with the **current working app**, rather than advertising features that haven't been implemented yet.