import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Adopt from "../pages/Adopt";
import Details from "../pages/Details";

import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AccountPage from "../pages/AccountPage";
import AdoptForm from "../pages/AdoptForm";
import AdoptQR from "../pages/AdoptQR";
import PaymentMethod from "../pages/PaymentMethod";
import SuccessPage from "../pages/SuccessPage";

import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Adoptions from "../pages/Admin/Adoptions";
import VolunteerForm from "../pages/VolunteerForm";
import VolunteerList from "../pages/Admin/VolunteerList";
import VolunteerDetail from "../pages/Admin/VolunteerDetail";

import Contact from "../pages/Contact";
import Donate from "../pages/Donate";
import News from "../pages/News";
import NewsDetail from "../pages/NewsDetail";

import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderSuccess from "../pages/OrderSuccess";
import Favorites from "../pages/Favorites";

import Post from "../pages/Admin/Post";
import User from "../pages/Admin/User";
import ListCategory from "../pages/Admin/Category/ListCategory";

import ProductPage from "../pages/Admin/product";
import OrderPage from "../pages/Admin/order";

import ChatBot from "../pages/ChatBot";

import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* USER */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/pet/:id" element={<Details />} />
        <Route path="/adopt-form/:id" element={<AdoptForm />} />
        <Route path="/payment/method/:id" element={<PaymentMethod />} />
        <Route path="/payment/:method/:id" element={<AdoptQR />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/volunteer" element={<VolunteerForm />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/success" element={<OrderSuccess />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/vaccination-schedule" element={<div className="py-20 text-center">Tính năng đang phát triển</div>} />
        </Route>
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ADMIN (đã fix trắng) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="adoptions" element={<Adoptions />} />
          <Route path="volunteers" element={<VolunteerList />} />
          <Route path="volunteers/:id" element={<VolunteerDetail />} />
          <Route path="post" element={<Post />} />
          <Route path="user" element={<User />} />
          <Route path="category" element={<ListCategory />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="order" element={<OrderPage />} />
        </Route>
      </Route>

    </Routes>
  );
}