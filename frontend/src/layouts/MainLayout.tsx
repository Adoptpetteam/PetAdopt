import { Outlet } from "react-router-dom"
import Footer from "../components/layout/Footer"
import Header from "../components/layout/Header"
import { useState } from "react"
import ShoppingChatBot from "../components/ShoppingChatBot"

export default function MainLayout() {
  const [showChat, setShowChat] = useState(false)

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />

      {/* Chatbot Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <ShoppingChatBot variant="widget" onClose={() => setShowChat(false)} />
        </div>
      )}

      {/* Chat Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#6272B6] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5567a8] transition z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}
    </>
  )
}