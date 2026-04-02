import { Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"

import Home from "../pages/Home"
import Adopt from "../pages/Adopt"
import Details from "../pages/Details"
import DonatePage from "../pages/DonatePage"

import RegisterPage from "../pages/RegisterPage"
import LoginPage from "../pages/LoginPage"
import AccountPage from "../pages/AccountPage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
import PageAdmin from "../components/layout/Admin/PageAdmin"
import DashboardAdmin from "../pages/Admin/DashboardAdmin"
import ListCategory from "../pages/Admin/Category/ListCategory"
import AdoptionManagement from "../pages/Admin/AdoptionManagement"

export default function AppRoutes() {
  return (
      <Routes>

        {/* Pages có Header + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/pet/:id" element={<Details />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/donate" element={<DonatePage />} />
        </Route>

        {/* Pages không có Header Footer */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/admin" element={<PageAdmin />}>
          <Route path="" element={<DashboardAdmin />} />
          <Route path="category" element={<ListCategory />} />
          <Route path="adoptions" element={<AdoptionManagement />} />
        </Route>

      </Routes>
  )
}