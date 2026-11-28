import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import CookieConsentDetails from "./pages/CookieConsentDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cookie-consent-details" element={<CookieConsentDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
