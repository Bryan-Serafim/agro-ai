# AgroAI 🌾

AgroAI is a practical AI application developed to support small-scale farmers in Brazil by providing accessible, context-aware agricultural guidance and crop diagnosis.

*Built by a collaborative team during the **Hack Conecta – Maratona da Inovação** hackathon in Porto Velho, Rondônia, Brazil (December 2025).*

---

## 1. Motivation

Small-scale farming in Brazil faces significant challenges, often lacking immediate access to specialized agronomic support. Farmers frequently encounter questions regarding planting techniques, pest control, and crop diseases, where timely advice can make the difference between a successful harvest and a significant loss. AgroAI was created to bridge this gap, providing farmers with an accessible, intelligent tool that delivers practical, immediate assistance directly to their devices.

## 2. Project Overview

AgroAI serves as a specialized agricultural assistant that guides farmers through everyday challenges. It is a practical problem-solving tool designed specifically for the agricultural domain. The application allows users to ask questions via text or upload images of their crops to identify potential diseases or issues, providing actionable advice tailored to their specific context.

## 3. Features

- **Chat-based Interface:** An intuitive communication channel for users to interact with the assistant.
- **Image-based Crop Analysis:** Users can upload photos of crops or plants for automated issue diagnosis and recommendations.
- **Context-aware Agricultural Responses:** Responses are tuned to provide practical, agriculturally sound guidance.
- **Secure Authentication:** User data and sessions are protected using Supabase Authentication.
- **Serverless AI Integration:** Interactions with external AI models are securely managed through Edge Functions.

## 4. Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Backend & Database:** Supabase (PostgreSQL, Authentication)
- **Serverless Compute:** Supabase Edge Functions
- **Artificial Intelligence:**
  - **OpenAI:** Contextual text generation and dialogue management.
  - **Google Cloud Vision API:** Image processing and visual analysis of crop issues.

## 5. Architecture Overview

AgroAI leverages a modern, serverless architecture to ensure scalability and ease of deployment. 
- The **Frontend** provides a responsive interface built with React and TypeScript, communicating directly with Supabase for authentication and database operations.
- The **Backend** relies on Supabase for data persistence and user management.
- **Supabase Edge Functions** act as a secure middleware layer, processing user requests from the frontend, managing API keys securely, and orchestrating calls to the OpenAI and Google Cloud Vision APIs before returning the synthesized guidance to the user.

## 6. How It Works

1. **Input:** The user authenticates and submits a query (text) or uploads a photo (image) through the React frontend.
2. **Processing:** The request is sent to a Supabase Edge Function to ensure secure and server-side execution.
3. **AI Analysis:** 
   - If the input involves an image, the Edge Function routes it to the Google Cloud Vision API for feature extraction and issue identification.
   - Text queries (and image analysis results) are sent to OpenAI to generate a clear, actionable response tailored for agricultural needs.
4. **Response:** The formulated advice is returned to the frontend and displayed to the farmer in the chat interface. Interaction data is stored in the Supabase PostgreSQL database for context continuity.

## 7. Getting Started

### Prerequisites

- Node.js installed
- A Supabase project set up
- API keys for OpenAI and Google Cloud Vision

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd agro-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env.local` file in the root directory and configure the necessary environment variables. *Note: Do not commit your secret keys to version control.*
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   *You will also need to securely configure the respective AI API keys directly within your Supabase Edge Functions environment.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 8. Future Improvements

- Offline support (PWA capabilities) for functionality in areas with poor internet connectivity.
- Integration with local weather APIs to provide proactive farming alerts.
- Extended database of regional Brazilian crops and local agricultural practices.
- Multi-language support and voice interaction to improve accessibility for a wider audience.

## 9. Team

This project was developed by:

- **Bryan Serafim** — Fullstack Developer *(Frontend + Backend integration, Supabase, Edge Functions)*
- **Filipe Ribeiro** — [Fullstack Developer](https://github.com/Filiperibas/) *(Backend, AI integration, APIs)*
- **Carlos Vitor** — Product & Business Strategy
- **Anna Clara** — UX/UI Design & User Experience
- **Werley Toledo** — Research & Domain Analysis *(Agriculture context)*
