import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import HomePage from "./pages/HomePage";
import RenterDashboard from "./pages/RenterDashboard";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import ListPropertyPage from "./pages/ListProperty";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";
import ServicesPage from "./pages/ServicePage";
import BookService from "./pages/BookService";
import RentAgreement from "./pages/RentAgreement";
import ChatPage from "./pages/ChatPage";
import ProvidersClientPage from "./pages/ProvidersPage";
import ProviderLogin from "./pages/ProviderLoginPage";
import ProviderDashboard from "./pages/ProvidersDashboard";
import ProviderRegister from "./pages/ProviderRegister";
import ForgotPassword  from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EditProperty from "./pages/EditProperty";


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminUsersPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RenterDashboard />} />
      <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      <Route path="/list-property" element={<ListPropertyPage />} />
      <Route path="/property/:id" element={<PropertyDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/book-service" element={<BookService />} />
      <Route path="/rent-agreement" element={<RentAgreement />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/service-providers/:id" element={<ProvidersClientPage />} />
      <Route path="/provider/login" element={<ProviderLogin />} />
      <Route path="/providers" element={<ProviderDashboard />} />
      <Route path="/provider/register" element={<ProviderRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/edit-property/:id" element={<EditProperty/>} />
    </Routes>
  );
}

export default App;
