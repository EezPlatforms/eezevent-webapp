import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import HelpPage from "./pages/HelpPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventsPage from "./pages/EventsPage";
import SearchVendorsPage from "./pages/SearchVendorsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/new" element={<CreateEventPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/search-vendors" element={<SearchVendorsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
