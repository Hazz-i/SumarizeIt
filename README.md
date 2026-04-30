# ✨ SumerizeIt

An AI-powered study companion that transforms any text, topic, or PDF into structured **summaries**, **key points**, and **flashcards** powered by Frieren, your magical study guide.

## Features

- 📝 **Paste Text** — Paste lecture notes, articles, or textbook paragraphs to summarize
- 🔍 **By Topic** — Enter any topic and get an instant summary and flashcards
- 📄 **Upload PDF** — Drag & drop or browse to upload a PDF (up to 32 MB)
- 🧠 **Smart Generation** — Choose what to generate: Summary, Key Points, Flashcards
- 🎯 **Explanation Levels** — Beginner, Intermediate, or Advanced
- ✨ **Scroll Animations** — Smooth GSAP-powered entrance and scroll-triggered animations

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 22+ installed
- An [OpenRouter](https://openrouter.ai) API key

### 1. Clone the repository

```bash
git clone https://github.com/Hazz-i/SummarizeIt.git
cd SummarizeIt
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and add your API key:

```bash
cp .env.example .env
```

Then edit `.env` and set your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production (optional)

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/summarize/     # API route for AI summarization
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx    # Hero with GSAP scroll animations
│   │   └── AppSection.tsx     # Main app interface
│   └── ui/                # Reusable UI components
└── lib/                   # Utility functions
```
