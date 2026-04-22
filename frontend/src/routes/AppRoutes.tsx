import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Adopt from "../pages/Adopt";
import Details from "../pages/Details";

import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import AdoptForm from "../pages/AdoptForm";
import SuccessPage from "../pages/SuccessPage";



import Contact from "../pages/Contact";
import Donate from "../pages/Donate";
import News from "../pages/News";
import NewsDetail from "../pages/NewsDetail";

import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";



import CustomerCare from "../pages/admin/CustomerCare"; // ✅ THÊM

import AdminRoute from "./AdminRoute";
import VolunteerForm from "../pages/VolunteerForm";
import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Adoptions from "../pages/Admin/Adoptions";
import VolunteerList from "../pages/Admin/VolunteerList";
import VolunteerDetail from "../pages/Admin/VolunteerDetail";
import Post from "../pages/Admin/Post";
import User from "../pages/Admin/User";
import ListCategory from "../pages/Admin/Category/ListCategory";
import ProductPage from "../pages/Admin/product";
import OrderPage from "../pages/Admin/order";
import AdoptStep2 from "../pages/AdoptStep2";
import PetDetailAdmin from "../pages/Admin/PetDetailAdmin";
import Favorites from "../pages/Favorites";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import AdminContacts from "../pages/Admin/AdminContacts";
import ContactDetail from "../pages/Admin/ContactDetail";
import AdminPets from "../pages/Admin/AdminPets";
import AddPet from "../pages/Admin/AddPet";
import EditPet from "../pages/Admin/EditPet";
import About from "../pages/About";

export default function AppRoutes() {
  return (
    <Routes>

      {/* USER */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/pet/:id" element={<Details />} />
        <Route path="/adopt-form/:id" element={<AdoptForm />} />
        <Route path="/adopt-form/:id/step-2" element={<AdoptStep2 />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/volunteer" element={<VolunteerForm />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
<<<<<<< Updated upstream
        <Route path="/about" element={<About />} />
=======
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/success" element={<OrderSuccess />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/vaccination-schedule" element={<VaccinationSchedule />} />
        </Route>
>>>>>>> Stashed changes
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ADMIN */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="adoptions" element={<Adoptions />} />
          <Route path="/admin/pet/:id" element={<PetDetailAdmin />} />
          <Route path="volunteers" element={<VolunteerList />} />
          <Route path="volunteers/:id" element={<VolunteerDetail />} />
          <Route path="post" element={<Post />} />
          <Route path="user" element={<User />} />
          <Route path="category" element={<ListCategory />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="order" element={<OrderPage />} />
<<<<<<< Updated upstream
          <Route path="/admin/contacts" element={<AdminContacts />} />
          <Route path="/admin/contacts/:id" element={<ContactDetail />} />
          <Route path="/admin/pets" element={<AdminPets />} />
          <Route path="/admin/pets/add" element={<AddPet />} />
          <Route path="/admin/pets/edit/:id" element={<EditPet />} />
=======
          <Route path="vaccination-care" element={<VaccinationCare />} />

        
          <Route path="customer-care" element={<CustomerCare />} />
>>>>>>> Stashed changes
        </Route>
      </Route>

    </Routes>
  );
}