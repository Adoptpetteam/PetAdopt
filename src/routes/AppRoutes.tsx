import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"

import Home from "../pages/Home"
import Adopt from "../pages/Adopt"
import Details from "../pages/Details"

import RegisterPage from "../pages/RegisterPage"
import LoginPage from "../pages/LoginPage"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Pages có Header + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/pet/:id" element={<Details />} />
        </Route>

        {/* Pages không có Header Footer */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

      </Routes>
    </BrowserRouter>
  )
}