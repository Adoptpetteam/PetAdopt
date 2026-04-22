import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'

// 👉 import fake data
import { defaultUsers } from './data/users'

const queryClient = new QueryClient();

// 👉 init fake DB
const initData = () => {
  const users = localStorage.getItem("users");
  if (!users) {
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
};

initData();

const googleClientId =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <App />
          </GoogleOAuthProvider>
        ) : (
          <App />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)