# Cognis - AI-Powered Strategic Productivity Dashboard

![Cognis Banner](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000)

Cognis is a next-generation personal and professional productivity ecosystem designed to centralize your life's complexities into a single, high-performance interface. Built with a focus on "AI-Native" workflows, Cognis goes beyond simple tracking—it analyzes, suggests, and optimizes your strategic progress.

## 🌌 Design Philosophy: The "Edge-to-Edge" Aesthetic
Cognis utilizes a bespoke, premium dark-mode aesthetic centered around the color `#0A0710`.
- **Flat Design:** Minimalist, sharp-cornered elements (`rounded-sm`) for a professional corporate feel.
- **Visual Hierarchy:** Layered depth using `#150F1D` panels and subtle purple-tinted borders.
- **Fluid Interactions:** Micro-animations powered by Framer Motion for a "living" interface.

---

## 🚀 Key Feature Modules

### 1. Unified Dashboard (Command Center)
Your tactical overview of current performance.
- **KPI Visualization:** Real-time tracking of revenue, tasks completion, and deep-work hours.
- **AI Strategic Insights:** A dedicated module that analyzes your data to provide proactive suggestions for your day.
- **Activity Streams:** Visual chronological breakdown of your latest movements across all modules.

### 2. Freelance Management (Business OS)
A professional-grade CRM and operations suite for the modern freelancer.
- **Client Intelligence:** Manage your client base with AI-powered sentiment analysis and value-tracking.
- **Proposals & Contracts:** High-conversion Kanban pipeline for managing leads to signed deals.
- **Time Tracking:** Integrated live timers with the ability to "AI-Suggest" billable hours based on project activity.

### 3. Financial Intelligence
A sophisticated financial tracking system that understands your cash flow.
- **Cashflow Analysis:** Interactive Recharts visualizations of income vs. expenses.
- **Smart Invoicing:** Draft professional invoices in seconds, with AI suggesting rates based on tracked time and market data.
- **Subscription Management:** Keep track of overhead and recurring costs effortlessly.

### 4. Personal Growth & Strategy
- **Strategic Journaling:** A distraction-free markdown editor for daily reflection.
- **Habit Alchemy:** Track daily rituals with "Streak" visualizations and trend analysis to see where you're gaining or losing momentum.
- **Goal Milestones:** Break down massive long-term goals into executable tactical milestones with progress tracking.

### 5. AI Assistant (Chat & Context)
The core "brain" of Cognis, fully integrated with your data.
- **Multi-Session Chat:** Organize different AI research threads into separate sessions.
- **Provider Agnostic:** Support for Google Gemini (Pro/Flash), OpenAI (GPT-4o), Groq (Llama 3), and Local LLMs (Ollama).
- **Context Awareness:** Chat with the AI about your journals, tasks, or financial data to get specific, localized insights.

### 6. Settings & AI Governance
- **API Management:** Securely manage your AI provider keys.
- **Otonomy Controls:** Configure how much control the AI has (e.g., automated invoicing, proactive rescheduling).
- **Profile Customization:** Unified profile management with Supabase-backed storage.

---

## 🛠 Technical Architecture

Cognis is built on a cutting-edge, high-performance tech stack:

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Components)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime Subscriptions)
- **State Management:** React Hooks + Supabase Realtime + Optimistic UI Updates
- **Styling:** Vanilla CSS + Tailwind CSS (Bespoke configuration)
- **AI Integration:** Google Generative AI, OpenAI SDK, and Custom REST Bridges
- **Charts:** [Recharts](https://recharts.org/) (Customized for Dark Corporate theme)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cognis-dashboard.git
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Initialize Database:**
   Run the provided SQL scripts in your Supabase SQL Editor to create the necessary tables (`chat_sessions`, `chat_messages`, `user_settings`, `profiles`).

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

---

## 🛡 Security & Privacy
- **RLS Policies:** Row Level Security ensures that every user only has access to their own data at the database level.
- **Local Fallback:** Support for local Ollama models ensures that sensitive strategic data can stay on your own hardware if required.

---

**Cognis** — *Design the life you want, strategize the steps to get there.*
