RAG Chatbot — Complete Design Specification
1. Project Architecture
Framework: React 18 + Vite + TypeScript
Routing: React Router DOM (/ and /workspace)
Styling: Tailwind CSS v3 + shadcn/ui base
Animation: Framer Motion (framer-motion) for all transitions, scroll-triggered reveals, and hover effects
Data: 100% mock data. No backend, no API calls, no real auth.
2. Design Language
Aesthetic: Dark deep-blue AI aesthetic. Premium, restrained, and glassmorphic. Inspired by Apple × Linear × Vercel × Perplexity.

Core principles:

Large spacing (py-24 to py-32 between sections)
Soft ambient gradients, not harsh colors
Subtle glows and blurs, never neon
Rounded everything (radius tokens: 1.25rem base, 28px for cards, 32px for CTA, 48px for phone)
Glassmorphism with strong blur + thin borders
No dashboard aesthetic, no analytics charts, no fake metrics
3. Global Design System (CSS Variables)
All colors are HSL. Define these in src/index.css under :root:

--background: 222 47% 5%;
--foreground: 210 40% 98%;

--card: 222 40% 8%;
--card-foreground: 210 40% 98%;

--popover: 222 45% 7%;
--popover-foreground: 210 40% 98%;

--primary: 217 91% 60%;
--primary-foreground: 222 47% 5%;
--primary-glow: 199 89% 65%;

--secondary: 222 30% 14%;
--secondary-foreground: 210 40% 98%;

--muted: 222 25% 12%;
--muted-foreground: 215 20% 65%;

--accent: 199 89% 60%;
--accent-foreground: 222 47% 5%;

--destructive: 0 72% 51%;
--destructive-foreground: 210 40% 98%;

--border: 222 30% 16%;
--input: 222 30% 14%;
--ring: 217 91% 60%;

--radius: 1.25rem;

--glass-bg: 222 40% 10% / 0.55;
--glass-border: 217 50% 70% / 0.12;

--gradient-hero: radial-gradient(ellipse at top, hsl(217 91% 60% / 0.18), transparent 60%), radial-gradient(ellipse at bottom right, hsl(199 89% 55% / 0.12), transparent 55%);
--gradient-primary: linear-gradient(135deg, hsl(217 91% 60%), hsl(199 89% 65%));
--gradient-text: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(199 89% 75%) 50%, hsl(217 91% 75%) 100%);
--gradient-glass: linear-gradient(135deg, hsl(222 40% 14% / 0.6), hsl(222 50% 8% / 0.4));

--shadow-glow: 0 0 60px hsl(217 91% 60% / 0.25);
--shadow-elevated: 0 30px 80px -20px hsl(222 80% 2% / 0.7);
--shadow-card: 0 8px 32px hsl(222 80% 2% / 0.5);
Global body background:

background-image:
  radial-gradient(ellipse 80% 50% at 50% -20%, hsl(217 91% 60% / 0.15), transparent),
  radial-gradient(ellipse 60% 50% at 80% 110%, hsl(199 89% 55% / 0.1), transparent);
background-attachment: fixed;
Utility classes to define:

.glass: var(--gradient-glass), backdrop-filter: blur(20px) saturate(140%), border: 1px solid hsl(var(--glass-border))
.glass-strong: hsl(222 40% 8% / 0.75), backdrop-filter: blur(28px) saturate(160%), border: 1px solid hsl(217 50% 70% / 0.14)
.text-gradient: var(--gradient-text), -webkit-background-clip: text, color: transparent
.bg-gradient-primary: var(--gradient-primary)
.shadow-glow: var(--shadow-glow)
.shadow-elevated: var(--shadow-elevated)
.grid-bg: 60px grid lines at hsl(217 50% 70% / 0.04)
.scrollbar-thin: 6px scrollbar, thumb hsl(217 50% 70% / 0.15)
Tailwind theme extensions:

primary.glow maps to hsl(var(--primary-glow))
Border radius: lg: var(--radius), md: calc(var(--radius) - 2px), sm: calc(var(--radius) - 4px)
4. Global Effects
4.1 Cursor Spotlight
A full-viewport fixed overlay at z-30 that follows the mouse with a 600px radial gradient:

background: radial-gradient(600px circle at Xpx Ypx, hsl(217 91% 60% / 0.08), transparent 40%);
pointer-events-none, aria-hidden. Updates on mousemove.

4.2 Page Transitions
Use AnimatePresence mode="wait" on routes. Every page entrance/exit:

Landing (/): initial={{ opacity: 0, scale: 0.99 }} → animate={{ opacity: 1, scale: 1 }} → exit={{ opacity: 0, scale: 0.98 }}, duration 0.6s, ease [0.22, 1, 0.36, 1]
Workspace (/workspace): initial={{ opacity: 0, scale: 1.02 }} → animate={{ opacity: 1, scale: 1 }} → exit={{ opacity: 0, scale: 0.98 }}, same timing
5. Page 1: Landing Page (/)
5.1 Navbar
Position: Fixed top, z-50, full width.
Container: max-w-7xl, px-6, centered.
Inner wrapper: rounded-2xl, px-5 py-3, transitions between:
Top: bg-transparent (no scroll)
Scrolled: glass-strong + shadow-elevated + tighter py-3
Logo (left): h-8 w-8 rounded-xl with bg-gradient-primary and shadow-glow. Inside: Sparkles icon h-4 w-4 in primary-foreground. Text: "RAG Chatbot", text-sm font-semibold tracking-tight.
Nav links (center, hidden on mobile): Documents, Chat, Sources, History, Settings. Each is an <a> with href="#lowercase", styled as rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground.
CTA button (right): "Start Asking" — rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow. Hover: scale-[1.03] + shadow-[0_0_40px_hsl(217_91%_60%/0.4)].
Entrance animation: initial={{ y: -40, opacity: 0 }}, animate={{ y: 0, opacity: 1 }}, duration 0.6s ease-out.
5.2 Hero Section
Layout: min-h-screen, centered content, pt-24 to clear navbar. overflow-hidden.
Background layers:
grid-bg at opacity-50
var(--gradient-hero) overlay
Floating orbs (absolute, blur-heavy):
Top-left: -top-32 left-1/4, h-96 w-96, bg-primary/30, blur-[120px], animate scale [1, 1.1, 1] + opacity [0.4, 0.6, 0.4] over 8s infinite.
Bottom-right: bottom-0 right-1/4, h-[28rem] w-[28rem], bg-accent/20, blur-[140px], animate scale [1, 1.2, 1] + opacity [0.3, 0.5, 0.3] over 10s infinite, delay 1s.
Particles: 24 absolute dots (h-1 w-1, bg-primary-glow/60). Positioned via modulo math on i. Each animates y: [0, -30, 0] and opacity: [0.2, 0.8, 0.2] over 4-9s, infinite, staggered delay i * 0.2.
Floating document cards (mouse-reactive parallax): Use useMotionValue for mouse X/Y normalized to [-15, 15].
Card 1 (left 8%, top 28%): DB_SCHEMA.md, icon FileCode, w-44. Motion transform x*0.6, y*0.6. Also floats y: [0, -12, 0] over 6s.
Card 2 (right 10%, top 22%): vectors · 768d, icon Database, w-48. Motion transform x*-0.4, y*-0.4. Floats y: [0, 14, 0] over 7s, delay 0.5s.
Card 3 (right 18%, bottom 26%): MEMORY.md, icon BookOpen, w-40. Motion transform x*0.3, y*0.3. Floats y: [0, -10, 0] over 5.5s, delay 1s.
All cards: glass class, rounded-2xl, shadow-elevated, hidden below lg.
Center content (z-10, max-w-5xl, centered text):
Pill badge: Inline-flex, rounded-full border border-border/60 bg-secondary/40 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur. Contains a live dot (pinging bg-primary + static bg-primary dot) + text "Source-backed AI · powered by pgvector". Entrance: opacity 0, y: 20 → opacity 1, y: 0, 0.6s.
H1: font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight. Line 1: <span className="text-gradient">Ask your documents.</span>. Line 2: <span className="text-foreground/90">Get grounded answers.</span>. Entrance: 0.7s, delay 0.1s.
Subtitle: mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground. Text: "Upload PDFs, paste text, and chat with your knowledge base using source-backed responses." Entrance: 0.6s, delay 0.25s.
Button row: Flex wrap, gap-3, mt-10.
"Upload Document": rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.03]. Icon Upload h-4 w-4.
"Paste Text": rounded-2xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur hover:bg-secondary hover:scale-[1.03]. Icon FileText h-4 w-4.
"Try the workspace": rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground. Icon ArrowRight h-4 w-4 with group-hover:translate-x-1.
5.3 Workspace Preview (Static, Non-Interactive)
Purpose: Visual only. Embedded in landing page to show what the app looks like.
Container: <section id="workspace-preview" aria-hidden="true" className="relative -mt-24 pb-32">
Inner: mx-auto max-w-7xl px-6, with inline pointerEvents: "none" and userSelect: "none".
Content: Render the <Workspace active /> component directly. It looks like a real workspace but cannot be interacted with.
5.4 Capabilities Section
ID: capabilities
Layout: py-32, max-w-7xl px-6, centered.
Header:
Eyebrow: text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow — "Capabilities"
H2: text-4xl md:text-5xl font-semibold tracking-tight — "Built for <span className='text-gradient'>grounded</span> intelligence"
Subtitle: text-muted-foreground — "Every component engineered to make your documents queryable, trustworthy, and fast."
Entrance: whileInView, once, opacity 0 y:20 → opacity 1 y:0.
Cards grid: mt-16, grid-cols-1 md:grid-cols-2 lg:grid-cols-4, gap-5.
Each card (TiltCard):
glass, rounded-3xl, p-7, h-full, overflow-hidden.
preserve-3d transform style.
3D tilt on hover: On mousemove, calculate x = (mouseX / width - 0.5) and y = (mouseY / height - 0.5), apply perspective(900px) rotateY(x*6deg) rotateX(-y*6deg) translateZ(0). Reset on mouseleave.
Ambient glow: Absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl, transitions to bg-primary/20 on group hover.
Icon: h-11 w-11 rounded-2xl bg-gradient-primary shadow-glow, icon inside h-5 w-5 text-primary-foreground.
Title: text-lg font-semibold tracking-tight
Desc: text-sm leading-relaxed text-muted-foreground
Entrance: whileInView, staggered delay: i * 0.08s, 0.5s duration.
Card data:
FileUp — "PDF & Text Ingestion" — "Drop PDFs or paste raw text. Auto-chunked, embedded, and indexed in seconds."
Search — "Vector Search" — "768-dimensional embeddings with pgvector cosine similarity at production scale."
ShieldCheck — "Source-backed Answers" — "Every claim links to the exact chunk it came from. No hallucinations."
Brain — "Conversation Memory" — "Context-aware threads remember what you asked twelve turns ago."
5.5 Mobile Showcase Section
Layout: py-32, overflow-hidden. Two-column grid (lg:grid-cols-2), gap-16, centered items.
Left text:
Eyebrow: "On the go", text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow
H2: text-4xl md:text-5xl font-semibold tracking-tight — "Your knowledge,<br/><span className='text-gradient'>in your pocket.</span>"
Paragraph: max-w-md text-muted-foreground leading-relaxed — "A native-feeling mobile experience that brings every document, every source, and every grounded answer with you wherever you go."
Tags: Two pills — "Concept showcase" and "Coming soon", rounded-full border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground.
Entrance: initial={{ opacity: 0, x: -30 }} → whileInView, 0.6s.
Right phone mockup:
Entrance: initial={{ opacity: 0, y: 40 }} → whileInView, 0.7s.
Glow behind: Absolute centered, h-80 w-80 rounded-full bg-primary/25 blur-[100px].
Phone shell: h-[600px] w-[290px], rounded-[48px], border border-border/60, bg-card, p-3, shadow-elevated.
Breathing animation: scale: [1, 1.015, 1] over 4s infinite ease-in-out.
Notch: absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background.
Screen: h-full w-full rounded-[36px] bg-background, with grid-bg and var(--gradient-hero) overlays.
Mini UI inside screen:
Header: Logo (h-7 w-7 rounded-lg bg-gradient-primary + Sparkles h-3.5 w-3.5) + "RAG" text. Avatar circle h-7 w-7 rounded-full bg-secondary/60 on right.
Chat bubbles:
User: glass rounded-2xl rounded-tr-md p-3 ml-8, text "Explain pgvector", text-[10px].
Assistant: glass rounded-2xl rounded-tl-md p-3 mr-8, paragraph about pgvector, text-[10px] leading-relaxed. Tag: rounded bg-primary/15 px-1.5 py-0.5 text-[8px] text-primary-glow — "DB_SCHEMA.md".
Input bar at bottom: rounded-full border border-border/50 bg-secondary/60 px-3 py-2, MessageSquare h-3 w-3, placeholder "Ask a question…".
5.6 CTA Section
Layout: py-32, max-w-5xl px-6, centered.
Card: glass relative overflow-hidden rounded-[32px] px-8 py-20 text-center shadow-elevated.
Inner gradient overlay: absolute inset-0 opacity-60, background var(--gradient-hero).
Floating orb: Absolute top center, left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]. Animate scale [1, 1.1, 1] + opacity [0.4, 0.6, 0.4] over 6s infinite.
Content (relative z-10):
H2: text-4xl md:text-6xl font-semibold tracking-tight — "Ready to chat with<br/>your <span className='text-gradient'>knowledge?</span>"
Paragraph: mx-auto max-w-xl text-muted-foreground — "Start in seconds. No setup. No backend headaches. Just answers grounded in your own documents."
Buttons (flex wrap, gap-3, mt-9):
"Start Asking": rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.03]. Icon ArrowRight h-4 w-4, group-hover:translate-x-1.
"Upload Docs": rounded-2xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium backdrop-blur hover:bg-secondary hover:scale-[1.03]. Icon Upload h-4 w-4.
Entrance: initial={{ opacity: 0, y: 30 }} → whileInView, 0.6s.
5.7 Footer
border-t border-border/40 py-10 text-center
Text: text-xs text-muted-foreground — "RAG Chatbot · grounded answers from your own knowledge."
6. Page 2: /workspace (Dedicated Workspace)
This page is a full-screen app experience with no landing page content. It uses h-screen w-screen flex flex-col overflow-hidden.

6.1 App Top Bar
Style: relative z-20, flex items-center justify-between, border-b border-border/40, bg-background/60, px-6 py-3, backdrop-blur-xl.
Left group:
Back button: Link to="/", flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground. Icon ArrowLeft h-3.5 w-3.5. Text: "Back".
Divider: mx-2 h-4 w-px bg-border/60.
Logo: h-7 w-7 rounded-lg bg-gradient-primary shadow-glow with Sparkles h-3.5 w-3.5 text-primary-foreground. Text: "RAG Chatbot", text-sm font-semibold tracking-tight.
Right status: flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-3 py-1 text-[11px] text-emerald-400/90. Icon CheckCircle2 h-3 w-3. Text: "All systems ready".
6.2 Workspace Component (<<Workspace active fullscreen />)
This is the same component rendered on both pages, but on /workspace it receives fullscreen prop.

Outer container: glass-strong, rounded-[28px], shadow-elevated, overflow-hidden.
If fullscreen: h-[85vh]
If not: h-[640px]
Top bar (inside workspace):
Left: macOS-style window dots — h-2.5 w-2.5 rounded-full in bg-destructive/60, bg-yellow-500/60, bg-emerald-500/60. Then text-xs text-muted-foreground — "workspace.rag".
Right: Document dropdown — rounded-lg border border-border/50 bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground. Text: "DB_SCHEMA.md", icon ChevronDown h-3 w-3.
Three-column grid: grid-cols-12, h-[calc(100%-49px)].
LEFT SIDEBAR (col-span-3, hidden below md)
New Chat button: w-full, rounded-xl bg-gradient-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02]. Icon Plus h-4 w-4.
Search: relative container. Search h-3.5 w-3.5 icon absolute left. Input: w-full rounded-lg border border-border/50 bg-secondary/40 py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/40. Placeholder: "Search chats".
Section label: px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 — "Recent Chats".
Chat list: scrollbar-thin space-y-0.5 overflow-y-auto.
Each item: flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-150.
Selected: bg-primary/15 text-foreground
Unselected: text-muted-foreground hover:bg-secondary/60 hover:text-foreground
Icon: MessageSquare h-3.5 w-3.5, colored text-primary-glow when selected.
Text: truncate, chat title.
Mock chats: "Project architecture", "Database schema" (active), "Day 4 backend", "Embedding pipeline", "UI planning".
CENTER PANEL (col-span-12 md:col-span-6, flex column)
Header:
border-b border-border/40 px-6 py-4
H2: text-base font-semibold tracking-tight — "Database schema"
Badge: rounded-full border border-border/50 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground. Icon FileText h-3 w-3 text-primary-glow. Text: "4 documents selected".
Status line below: mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400/90. Icon CheckCircle2 h-3 w-3. Text: "All systems ready".
Chat content: scrollbar-thin flex-1 overflow-y-auto px-6 py-6.
User message (right-aligned):
flex justify-end
Bubble: max-w-[80%] rounded-2xl rounded-tr-md bg-primary/15 px-4 py-2.5 text-sm
Text: "What database does this project use?"
Entrance: initial={{ opacity: 0, y: 8 }} → animate, 0.2s default.
Assistant message (left-aligned):
flex gap-3
Avatar: h-7 w-7 shrink-0 rounded-xl bg-gradient-primary with Sparkles h-3.5 w-3.5 text-primary-foreground.
Content:
Paragraph: text-sm leading-relaxed. Inline code/highlight spans: rounded bg-secondary/60 px-1.5 py-0.5 text-xs text-primary-glow for "Postgres" and "pgvector". Bold font-medium text-foreground for "768-dimensional embeddings".
Source tags row: flex flex-wrap gap-1.5 pt-1. Each tag: rounded-md border border-border/50 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground. Tags: "DB_SCHEMA.md", "MEMORY.md", "TASKS.md".
Entrance: delay 0.2s.
Suggested chips: mt-8 flex flex-wrap gap-2.
Each chip: rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground. Hover: hover:border-primary/40 hover:bg-primary/10 hover:text-foreground, transition 200ms.
Chips: "Summarize document", "Explain pgvector", "What changed", "Find backend errors".
Input bar: border-t border-border/40 p-4.
Container: flex items-center gap-2 rounded-2xl border border-border/50 bg-secondary/40 px-4 py-3. Focus state: focus-within:border-primary/40 focus-within:bg-secondary/60 transition-colors.
Input: flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none.
Send button: h-8 w-8 rounded-xl bg-gradient-primary text-primary-foreground hover:scale-105.
Typing placeholder animation: When input is empty, cycle through phrases with a typewriter effect:
Phrases: "Ask anything about your docs…", "Try: explain pgvector", "Try: what changed in day 4"
Type speed: ~70ms per char. Delete speed: ~30ms per char. Pause at full phrase: ~1200ms.
RIGHT SIDEBAR (col-span-3, hidden below md)
Header: border-b border-border/40 px-4 py-4.
Label: text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 — "Grounded Sources".
Subtext: text-[11px] text-muted-foreground — "3 chunks · top-k retrieval".
Source list: scrollbar-thin space-y-2 overflow-y-auto p-3.
Each source is a motion.button with layout prop.
Style: block w-full rounded-xl border border-border/50 bg-secondary/30 p-3 text-left. Hover: hover:border-primary/40 hover:bg-secondary/60, transition 200ms.
Row 1: Icon in rounded-lg bg-primary/15 p-1.5 (icon text-primary-glow h-3.5 w-3.5). Title: text-xs font-medium truncate. Match %: text-[10px] font-semibold text-primary-glow.
Progress bar: mt-2 h-1 overflow-hidden rounded-full bg-secondary. Animated fill: motion.div with bg-gradient-primary, initial={{ width: 0 }} → animate={{ width: 'X%' }}, 0.8s easeOut.
Hover-expand preview: On onHoverStart/onHoverEnd, show AnimatePresence paragraph. Animation: opacity 0 height 0 marginTop 0 → opacity 1 height auto marginTop 8 → exit reverse, 0.2s. Text: preview truncated to 90 chars + "…", text-[10.5px] leading-relaxed text-muted-foreground.
Source data:
Database icon — "DB_SCHEMA.md" — 97% — "Postgres tables: documents, chunks, embeddings (vector(768)). Uses pgvector extension with IVFFlat index on chunks.embedding for cosine similarity search."
BookOpen icon — "MEMORY.md" — 91% — "Conversation memory stores last 12 turns. Retrieval augments queries with top-k chunks (k=4) from selected documents."
FileCode icon — "TASKS.md" — 86% — "Day 4: backend wiring complete. Embedding pipeline uses text-embedding-3-small (768d). Chunk size: 512 tokens with 64 overlap."
SOURCE SIDE DRAWER (Overlay)
Triggered by clicking a source in the right panel.
Backdrop: absolute inset-0 z-40 bg-background/60 backdrop-blur-sm. AnimatePresence fade 0.2s. Click to close.
Panel: absolute right-0 top-0 z-50 h-full w-full max-w-md glass-strong border-l border-border/50 p-6.
Entrance: spring, stiffness: 280, damping: 32, from x: "100%".
Content:
Header: text-[10px] uppercase tracking-wider text-muted-foreground — "Source". H3: text-lg font-semibold — source name. Close button: rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground, icon X h-4 w-4.
Preview card: rounded-xl border border-border/50 bg-secondary/30 p-4, paragraph text-xs leading-relaxed text-muted-foreground — full preview text.
Similarity row: flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-xs. Label "Similarity", value font-semibold text-primary-glow + "%".
7. Navigation Architecture
Landing page (/): Contains Navbar, Hero, Workspace Preview (static), Capabilities, Mobile Showcase, CTA, Footer.
Workspace page (/workspace): Contains ONLY the app top bar + fullscreen Workspace component. No hero, no marketing, no CTA.
Transition: All "Start Asking" buttons (Navbar, Hero, CTA) and "Upload Document"/"Paste Text"/"Upload Docs" buttons trigger navigate('/workspace') via React Router.
No scroll hijacking: Do NOT use scrollIntoView, anchor links, hash navigation, or state-based fake page transitions. Use real route navigation with AnimatePresence page transitions.
8. Responsive Behavior
Mobile (< md / 768px): Left and right sidebars in the workspace are hidden (hidden md:flex). Center chat takes full width (col-span-12).
Desktop: Three-column layout as described.
Navbar nav links hidden on mobile.
Hero floating document cards hidden below lg.
9. Key Animation Summary
Element	Type	Duration	Easing
Page transitions	Fade + scale	0.6s	[0.22, 1, 0.36, 1]
Navbar entrance	Slide down + fade	0.6s	easeOut
Hero content	Staggered fade up	0.6–0.7s	default ease
Hero orbs	Scale + opacity pulse	8–10s	easeInOut infinite
Hero particles	Float up + opacity	4–9s	ease infinite
Floating cards	Float Y	5.5–7s	ease infinite
Capabilities cards	Fade up + tilt	0.5s, stagger 0.08s	default
CTA orb	Scale + opacity	6s	easeInOut infinite
Phone mockup	Breathing scale	4s	easeInOut infinite
Source bars	Width grow	0.8s	easeOut
Source hover preview	Height expand	0.2s	default
Side drawer	Slide from right	spring	stiffness 280, damping 32
10. Exact Fonts
Headings: font-display (map to a clean geometric sans like Inter or SF Pro Display via Tailwind config).
Body: Default sans (Inter).
Apply font-feature-settings: "cv11", "ss01", "ss03" on body.
11. Iconography
Use Lucide React icons exclusively:

Sparkles (logo/avatar)
Upload, FileText, ArrowRight, Plus, Search, MessageSquare, ChevronDown, Send, X, FileCode, Database, BookOpen, CheckCircle2, ArrowLeft, FileUp, Search, ShieldCheck, Brain
All icons are stroke-based, never filled. Stroke width defaults to 1.5–2.5 for logo icons.