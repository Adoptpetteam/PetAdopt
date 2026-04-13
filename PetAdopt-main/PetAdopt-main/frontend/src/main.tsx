import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)