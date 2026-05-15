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
import AdoptionDetail from "../pages/Admin/AdoptionDetail";
import Volunteer from "../pages/Volunteer";
import Volunteers from "../pages/Admin/Volunteers";
import Reviews from "../pages/Admin/Reviews";

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
import PetCategories from "../pages/Admin/Category/PetCategories";
import ProductCategories from "../pages/Admin/Category/ProductCategories";
import Pets from "../pages/Admin/Pets";
import AddPet from "../pages/Admin/AddPet";
import EditPet from "../pages/Admin/EditPet";
import AdoptedPets from "../pages/Admin/AdoptedPets";
import ProductPage from "../pages/Admin/product";
import OrderPage from "../pages/Admin/order";
import CustomerPage from "../pages/Admin/CustomerPage";
import Statistics from "../pages/Admin/Statistics";
import VoucherPage from "../pages/Admin/VoucherPage";
import VaccinationAdmin from "../pages/Admin/VaccinationAdmin";
import Supporters from "../pages/Admin/Supporters";
import Vaccinations from "../pages/Admin/Vaccinations";

import AdminRoute from "../routes/AdminRoute";
import AdminLogin from "../pages/Admin/AdminLogin";
import ChatBot from "../pages/ChatBot";
import ProtectedRoute from "./ProtectedRoute";

import PaymentResult from "../pages/PaymentResult";
import VaccinationSchedule from "../pages/VaccinationSchedule";
import MyAdoptions from "../pages/MyAdoptions";
import Notifications from "../pages/Notifications";
import PetCare from "../pages/PetCare";
import MyPets from "../pages/MyPets";

export default function AppRoutes() {
  return (
    <Routes>
      {/* USER */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/pet/:id" element={<Details />} />
        <Route path="/adopt-form/:id" element={<AdoptForm />} />
        <Route
          path="/payment/method/:id"
          element={<PaymentMethod />}
        />
        <Route
          path="/payment/:method/:id"
          element={<AdoptQR />}
        />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<Orders />} />
        <Route
          path="/orders/success"
          element={<OrderSuccess />}
        />
        <Route
          path="/orders/payment-result"
          element={<PaymentResult />}
        />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/chatbot" element={<ChatBot />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/vaccination-schedule"
            element={<VaccinationSchedule />}
          />
          <Route
            path="/my-adoptions"
            element={<MyAdoptions />}
          />
          <Route
            path="/notifications"
            element={<Notifications />}
          />
          <Route
            path="/pet-care"
            element={<PetCare />}
          />
          <Route
            path="/my-pets"
            element={<MyPets />}
          />
        </Route>
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ADMIN */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="adoptions"
            element={<Adoptions />}
          />
          <Route
            path="adoptions/:id"
            element={<AdoptionDetail />}
          />

          <Route
            path="volunteers"
            element={<Volunteers />}
          />

          <Route
            path="reviews"
            element={<Reviews />}
          />

          <Route path="supporters" element={<Supporters />} />
          <Route path="vaccinations" element={<Vaccinations />} />

          <Route path="post" element={<Post />} />
          <Route path="user" element={<User />} />
          <Route
            path="category"
            element={<ListCategory />}
          />
          <Route
            path="pet-categories"
            element={<PetCategories />}
          />
          <Route
            path="product-categories"
            element={<ProductCategories />}
          />

          <Route path="pets" element={<Pets />} />
          <Route
            path="pets/add"
            element={<AddPet />}
          />
          <Route
            path="pets/edit/:id"
            element={<EditPet />}
          />

          <Route
            path="product"
            element={<ProductPage />}
          />
          <Route
            path="order"
            element={<OrderPage />}
          />

          {/* THỐNG KÊ */}
          <Route
            path="statistics"
            element={<Statistics />}
          />

          {/* VOUCHER */}
          <Route
            path="vouchers"
            element={<VoucherPage />}
          />

          {/* VACCINATION SCHEDULE */}
          <Route
            path="vaccinations"
            element={<VaccinationAdmin />}
          />

          {/* THÔNG TIN KHÁCH HÀNG */}
          <Route
            path="customers"
            element={<CustomerPage />}
          />

          <Route
            path="adopted-pets"
            element={<AdoptedPets />}
          />
        </Route>
      </Route>
    </Routes>
  );
}