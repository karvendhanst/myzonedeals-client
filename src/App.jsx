import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DealerDashboard from "./pages/DealerDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import useAuthStore from "./store/authStore";

// ── Existing pages (preserved) ──
import DealerPortal from "./pages/DealerPortal";
import AddShopForm from "./pages/AddShopForm";
import AddDealsPage from "./pages/AddDealsPage";
import ShopDealsPage from "./pages/ShopDealsPage";
import DealerProfile from "./pages/DealerProfile";

// ── New listing pages ──
import PostSomethingPage from "./pages/PostSomethingPage";
import ListingFormPage from "./pages/ListingFormPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import MyListingsPage from "./pages/MyListingsPage";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/shop-portal" element={<DealerPortal />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* ── Post Something (requires auth) ── */}
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostSomethingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:listingType"
          element={
            <ProtectedRoute>
              <ListingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Existing protected routes (unchanged) ── */}
        <Route
          path="/add-shop"
          element={
            <ProtectedRoute>
              <AddShopForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute>
              <DealerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealer-profile"
          element={
            <ProtectedRoute>
              <DealerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/:shopId/add-deals"
          element={
            <ProtectedRoute>
              <AddDealsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/:shopId/deals"
          element={
            <ProtectedRoute>
              <ShopDealsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
