# 🎒 Doremon's Learning World — AI-Powered Gamified LMS

> Turn college study materials (PowerPoint presentations and PDFs) into an engaging, cartoon-inspired educational adventure where every concept emerges magically from Doraemon's 4D pocket!

---

## 🌟 Overview

**Doremon's Learning World** is an AI-powered Learning Management System (LMS) designed to turn college textbooks (`.pdf`) and lecture presentations (`.pptx`) into structured, topic-wise interactive courses, lessons, quizzes, revision notes, and exam simulations.

Inspired by a friendly blue robotic cat, students enter an immersive 3D cartoon world where the mascot guides them through their learning journey.

---

## 🚀 Quick Start Guide (Beginner-Friendly)

### Option 1: Double-Click Launcher (Windows)
Double-click **`start.bat`** in the project root directory. It runs the full-stack server and launches your browser automatically at:
```
http://127.0.0.1:8000
```

### Option 2: Command Line (One-Liner)
Run the following command from PowerShell or Command Prompt:
```powershell
backend\venv\Scripts\python.exe run.py
```
Open **`http://127.0.0.1:8000`** in any web browser.

---

## 🧭 The 8 Main LMS Navigation Sections

The application features 8 dedicated, intuitive navigation sections:

1. 🏠 **Home**: Cartoon world headquarters with animated mascot, welcome banner, prominent **Start Learning** and **+ Upload New PPT / PDF** buttons, Today's Learning Mission, Continue Learning card, quick metrics, and the Doraemon 4D Learning Gadgets shelf.
2. 📚 **My Courses**: Comprehensive course management. View descriptions, learning objectives, completion percentages, resume unfinished lessons, add chapters and topics manually, inspect raw extracted text, view 100% coverage checklists, and safely delete or retry courses.
3. 📂 **My Materials**: Study document repository for `.pptx` and `.pdf` files. Inspect raw chunks, monitor background processing, and audit zero-omission extraction.
4. 📖 **Learn**: The interactive topic roadmap and deep pedagogical lesson viewer. Clicking any topic activates the signature **4D Magical Pocket Animation**. Features Hinglish toggles, Indian company case studies, formulas, Mermaid workflow diagrams, and Small Light (ELI5) simplify mode.
5. 🎯 **Quiz Time**: Practice assessment portal. Filter by course, session, or topic; choose difficulty (Easy, Medium, Hard); take untimed practice tests or 15-minute timed mock exams with instant mascot feedback and explanations.
6. 🍞 **Revision Centre**: Powered by the iconic **Memory Bread**. Flip through spaced-repetition flashcard decks (definitions, formulas, key concepts), mark cards as memorized, and review weak topics before university exams.
7. 🏆 **My Progress**: Gamified student learning passport. Track current Level, XP, daily streak flame counter, unlocked achievement badges, and the **Doraemon Gadget Collection** unlocked through learning.
8. ⚙️ **Settings**: Dual-engine AI configuration. Securely store your Google Gemini API key, switch LLM models (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-pro`), test API latency with 1-click ping, and toggle audio sound effects.

---

## 🎭 The 10 Mascot Character Animation States

Doremon's Learning World implements 10 responsive character animation states:

1. **Idle**: Subtle breathing pulsation, gentle blinking, eyes glancing around.
2. **Welcome**: Cheerful smile, waving right paw, welcoming speech bubble.
3. **Thinking**: Curious tilted head, paw on chin, thought bubble floating up while AI prepares explanations.
4. **Searching**: Reaching deep down into the 4D pocket, looking down curiously, pocket stretching and glowing.
5. **Presenting**: Raising a sparkling learning gadget high above head with radiating golden stars.
6. **Teaching**: Confident teacher pose holding a pointer stick towards the lesson notes.
7. **Celebrating**: Jumping up in victory with both paws raised and bursting confetti.
8. **Encouraging**: Warm sympathetic eyes, supportive smile, thumbs up after an incorrect quiz answer.
9. **Uploading**: Arms outstretched holding a study paper with an intake beam ready to receive files.
10. **Processing**: Holding a magnifying glass and scanning document pages with an animated green laser beam.

---

## ✨ Signature Feature: The Magical 4D Pocket

Every selected topic emerges dynamically from the mascot's pocket through a 6-stage magical sequence:
1. **Reaction**: Mascot reacts to your selection.
2. **Look Down**: Mascot turns its gaze towards the 4D pocket.
3. **Searching**: Mascot's paw reaches deep inside the pocket with rhythmic searching motion.
4. **Magical Flash**: Golden particles, stars, and pocket aura burst with synthesized chimes.
5. **Gadget Emergence**: A floating learning gadget rises from the pocket displaying the **actual extracted topic title**.
6. **Learning Card**: The gadget opens into a learning card with topic summary and direct button to enter the full lesson.

### 7 Dynamic Gadget Archetypes
The application adapts the emerging gadget to the content type:
- 📖 **Magical Concept Tome** (Definitions)
- 🧮 **Glowing Quantum Calculator** (Formulas & Equations)
- 📊 **3D Holographic Projector** (Diagrams & Architecture)
- 🏢 **Miniature Corporate Stage** (Case Studies & Indian Industry)
- 📑 **Pocket Revision Notebook** (Revision Notes & Summaries)
- 🎯 **Floating Challenge Cards** (Practice Quizzes)
- 🎴 **Animated Memory Deck** (Flashcards & Memorization)

*Includes a **Skip Animation** button for quick studying.*

---

## 🛠️ Doraemon-Inspired Learning Gadgets

| Gadget | Capability | Purpose |
| :--- | :--- | :--- |
| 🚪 **Anywhere Door** | **Course Explorer** | Searchable teleportation portal to navigate across any module, chapter, or topic. |
| 🍞 **Memory Bread** | **Revision Centre** | Spaced-repetition flashcards for definitions, formulas, and last-minute revision sheets. |
| 🚁 **Take-copter** | **Concept Mindmap** | Visual syllabus mindmap displaying interconnected hierarchical course structures. |
| ⏳ **Time Machine** | **Exam Preparation** | 15-minute countdown timed mock examination simulator with automated grading. |
| 🔦 **Small Light** | **Simplify Mode (ELI5)** | One-click toggle that rewrites complex material into 5th-grade terms using simple analogies. |
| 🎯 **Quiz Gadget** | **Assessment Arena** | Topic-by-topic interactive quizzes with option-by-option explanations awarding XP. |

---

## 📚 What Every Pedagogical Lesson Includes

Every uploaded document is automatically analyzed and synthesized into a structured lesson containing:
1. 📌 **Topic Title & Unit Citation** (`Slide 2`, `Page 3`)
2. 📖 **Simple Definition**
3. 🇺🇸 **Detailed Explanation in Easy English**
4. 🇮🇳 **Conversational Hinglish Mode** (Toggleable with 1 click)
5. 🪜 **Step-by-Step Breakdown** (Ordered phases)
6. 🎯 **Points Directly Quoted from Lecture Notes**
7. 🌍 **Real-Life Everyday Analogies**
8. 🏢 **Indian Company Case Studies** (UPI / NPCI, Tata Motors EV, Reliance Jio, Zomato, ISRO, Flipkart, Zerodha)
9. 📚 **Important Terminology & Meanings**
10. 🧮 **Formulas with Solved Examples & Variable Breakdowns**
11. 📊 **Interactive Workflow Diagrams & Mermaid Flowcharts**
12. ⚖️ **Advantages vs Disadvantages & Comparison Tables**
13. 📝 **University Exam Strategy & Marking Schemes**
14. ❓ **Short-Answer Questions (2 marks)** with model answers
15. ❓ **Long-Answer Questions (5-10 marks)** with structured answer guidelines
16. 🍞 **Memory Bread Quick Revision Summary**
17. 🔦 **Small Light (ELI5) Simplified Explanations**
18. 🎮 **Practice Quiz with Instant Feedback and Explanations**
19. 💡 **Quick Tutor Action Companion Pills** (Explain Simply, Hinglish, Example, Diagram, Quiz, Revise)
20. 🏆 **Mark as Completed (+50 XP)** button with celebratory confetti

---

## 📋 100% Zero-Omission Slide/Page Coverage Guarantee

Click **Coverage** on any course card or inside the course view to view the **Coverage Checklist**.
It maps every single slide and page number:
- Verified status ("Processed & Converted")
- Extracted paragraphs, bullet points, and tables count
- Assigned teaching topic name
- Assures students that **not a single slide was silently omitted**.

---

## 🔑 AI Engine & Dual-Engine Architecture

1. **Local Intelligent Engine (Out of the Box)**:
   - Works immediately with **zero setup** and **no API keys required**!
   - Extracts 100% of slides/pages, detects modules, creates lessons, Hinglish explanations, Indian case studies, and practice quizzes directly from your material.

2. **Google Gemini LLM Engine (Supercharged AI)**:
   - Open **Settings** from the navigation bar.
   - Enter your **Google Gemini API Key**.
   - Select your model: `gemini-1.5-flash`, `gemini-2.0-flash`, or `gemini-pro`.
   - Click **Test API Connection** to verify with 1 click.
   - Keys are stored securely in backend SQLite and never exposed to the frontend.

---

## 🧪 Running the 13-Stage Automated Test Suite

We have included a full automated test suite verifying all requirements:
```powershell
backend\venv\Scripts\python.exe test_study_world.py
```

### Verified Test Stages:
1. `[TEST 1]` API Health Check
2. `[TEST 2]` Uploading PowerPoint (`.pptx`)
3. `[TEST 3]` Background 5-Stage Processing Pipeline (`Uploading` → `Reading` → `Identifying` → `Generating` → `Ready`)
4. `[TEST 4]` 100% Slide Coverage Audit Guarantee
5. `[TEST 5]` Pedagogical Lesson Generation (Hinglish, Indian case study, formulas, Mermaid diagrams, ELI5 mode)
6. `[TEST 6]` Uploading PDF (`.pdf`) & Multi-Course Preservation
7. `[TEST 7]` RAG AI Tutor with Grounded Slide Citations
8. `[TEST 8]` Practice Quiz Grading, XP Points (+50 XP), and Weak Topic Tracking
9. `[TEST 9]` Doraemon Gadgets (Anywhere Door, Memory Bread, Time Machine)
10. `[TEST 10]` Persistence across database reloads
11. `[TEST 11]` Extracted Raw Text Audit (`/api/courses/{id}/raw-text`)
12. `[TEST 12]` Manual Course Creation, Session Creation & Topic Generation
13. `[TEST 13]` Safe Course Deletion and Course Isolation

---

## 📂 Project Architecture

```
PM - 2/
├── backend/
│   ├── database.py              # SQLite schema (courses, sessions, topics, lessons, quizzes, progress, chunks)
│   ├── main.py                  # FastAPI server with CORS & SPA static file serving
│   ├── extractors/
│   │   ├── pptx_extractor.py    # Extracts slides, shapes, tables, notes using python-pptx
│   │   └── pdf_extractor.py     # Extracts pages, headings, tables using pypdf
│   ├── processors/
│   │   ├── topic_detector.py    # Zero-omission topic structure organizer & coverage mapper
│   │   ├── pedagogy_engine.py   # Multi-dimensional lesson synthesizer (Gemini LLM + Heuristics)
│   │   ├── rag_service.py       # Slide-grounded RAG search with exact citations
│   │   └── gamification.py      # XP, streak tracking, anti-exploit protection, badges
│   ├── gadgets/
│   │   └── gadget_service.py    # Anywhere Door, Memory Bread, Time Machine services
│   └── routers/
│       ├── courses.py           # Upload, list, detail, coverage, raw-text, manual course/topic, retry, delete
│       ├── lessons.py           # Rich lesson delivery & completion
│       ├── quizzes.py           # Quiz retrieval & automated grading
│       ├── tutor.py             # Grounded AI Tutor chat with RAG
│       ├── gadgets.py           # Gadget endpoints
│       ├── gamification.py      # User profile & metrics
│       └── settings.py          # Secure API key management & ping test
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # 8-tab navigation, Bell motif, XP meter, streak, sound switch
│   │   │   ├── DoraemonMascot.tsx   # 10 character animation states (idle, welcome, thinking, searching, etc.)
│   │   │   ├── PocketTopicModal.tsx # Centerpiece 4D Pocket animation with 7 gadget archetypes
│   │   │   ├── GadgetsBar.tsx       # 4D Learning gadgets bar
│   │   │   ├── CourseCard.tsx       # Progress bar, status badges, coverage & raw text buttons
│   │   │   ├── CoverageModal.tsx    # 100% slide/page verification checklist
│   │   │   ├── RawTextModal.tsx     # Extracted source text audit & inspection
│   │   │   ├── CreateCourseModal.tsx# Manual course builder
│   │   │   ├── AddTopicModal.tsx    # Manual chapter & topic addition
│   │   │   ├── LessonViewer.tsx     # Comprehensive teaching view (Hinglish, ELI5, diagrams, case studies)
│   │   │   ├── QuizModal.tsx        # Interactive practice quizzes with explanations
│   │   │   ├── TutorDrawer.tsx      # RAG AI Tutor chatbot with citation chips & thinking mascot
│   │   │   ├── AnywhereDoorModal.tsx# Teleport search portal
│   │   │   ├── MemoryBreadModal.tsx # Spaced repetition flashcard deck
│   │   │   ├── TimeMachineModal.tsx # 15-min countdown timed mock exam
│   │   │   ├── TakeCopterModal.tsx  # Concept tree roadmap
│   │   │   └── SettingsModal.tsx    # Gemini API key configuration & testing
│   │   ├── services/
│   │   │   ├── api.ts               # Typed REST API client
│   │   │   └── soundEffects.ts      # Synthesized Web Audio API sound effects
│   │   ├── types/index.ts           # Full TypeScript data contracts
│   │   └── App.tsx                  # Complete 8-section LMS application
│   └── dist/                        # Production build
├── sample_materials/
│   ├── Computer_Networks_and_Cloud_Architecture.pptx
│   └── Operating_Systems_and_Concurrency.pdf
├── run.py                           # One-command full-stack server & browser launcher
├── start.bat                        # Double-click launcher for Windows
└── test_study_world.py              # Automated 13-stage test suite
```

---

## 🎨 Cartoon Theme Palette

- **Sky Blue**: `#0288D1`, `#03A9F4` (Doraemon signature hue)
- **Collar Red**: `#E53935` (Accent badge & alert motifs)
- **Golden Bell Yellow**: `#FFD600` (Gleaming bell, XP, and streak fire)
- **Pocket White**: `#FFFFFF`, `#F8FAFC` (4D Pocket clean cards)

---
*Built with ❤️ for college students everywhere!*
