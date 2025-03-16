import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Suspense, lazy, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "./components/common/Spinner";
import PrivateRoute from "./components/auth/PrivateRoute";
import OwnerRoute from "./components/auth/OwnerRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import Login from "./pages/Login";
import { API_URL } from "./config/constants";
// import dotenv from 'dotenv';

// dotenv.config();

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import About from "./pages/About";
import { ListingProvider } from "./context/ListingContext";
import { LocationProvider } from "./context/LocationContext";

// Lazy-loaded pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerificationSent = lazy(() => import("./pages/auth/VerificationSent"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Search = lazy(() => import("./pages/Search"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
const BookingForm = lazy(() => import("./pages/BookingForm"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const UserBookings = lazy(() => import("./pages/UserBookings"));
const UserFavorites = lazy(() => import("./pages/UserFavorites"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contact = lazy(() => import("./pages/Contact"));

// Owner pages
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const OwnerListings = lazy(() => import("./pages/owner/OwnerListings"));
const CreateListing = lazy(() => import("./pages/owner/CreateListing"));
const OwnerBookings = lazy(() => import("./pages/owner/OwnerBookings"));

// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireVerified = true,
}) => {
  const { user, initialLoading, isEmailVerified } = useAuth();

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" color="indigo" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verification-sent" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect if logged in
const RedirectIfLoggedIn = ({ children }) => {
  const { user, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" color="indigo" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  // const [serverConnected, setServerConnected] = useState(true);
  // // const { user, loading } = useAuth();

  // useEffect(() => {
  //   const checkServer = async () => {
  //     try {
  //       console.log('Attempting to connect to:', API_URL);
  //       const response = await fetch(`${API_URL}/listings`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         credentials: 'include'
  //       });

  //       if (!response.ok) {
  //         const errorText = await response.text();
  //         console.error('Server response not OK:', {
  //           status: response.status,
  //           statusText: response.statusText,
  //           errorText
  //         });
  //         setServerConnected(false);
  //       } else {
  //         const data = await response.json();
  //         console.log('Server response:', data);
  //         if (data.success) {
  //           setServerConnected(true);
  //         } else {
  //           console.error('Server response indicates failure:', data);
  //           setServerConnected(false);
  //         }
  //       }
  //     } catch (err) {
  //       console.error('Server connection error:', {
  //         message: err.message,
  //         stack: err.stack
  //       });
  //       setServerConnected(false);
  //     }
  //   };

  //   checkServer();

  //   // Set up periodic health checks
  //   const interval = setInterval(checkServer, 30000); // Check every 30 seconds

  //   return () => clearInterval(interval);
  // }, []);

  // if (!serverConnected) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
  //         <h2 className="text-2xl font-bold text-red-600 mb-4">Server Connection Error</h2>
  //         <p className="text-gray-600 mb-4">
  //           Unable to connect to the server. Please ensure the backend server is running at {API_URL}
  //         </p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="bg-[#FE6F61] text-white px-4 py-2 rounded hover:bg-[#e3837a] transition-colors"
  //         >
  //           Retry Connection
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <Spinner size="large" color="indigo" />
          </div>
        }
      >
        <BrowserRouter>
          <ListingProvider>
            <LocationProvider>
              {" "}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/contact"
                  element={
                    <MainLayout>
                      <Contact />
                    </MainLayout>
                  }
                />
                <Route path="/listings/:id" element={<ListingDetails />} />
                <Route path="/not-found" element={<NotFound />} />

                {/* Auth Routes - Only accessible if not logged in */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <Register />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPassword />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicOnlyRoute>
                      <ResetPassword />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/verification-sent"
                  element={
                    <PublicOnlyRoute>
                      <VerificationSent />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <PublicOnlyRoute>
                      <VerifyEmail />
                    </PublicOnlyRoute>
                  }
                />

                {/* User Routes - Requires authentication */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/bookings"
                  element={
                    <PrivateRoute>
                      <UserBookings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PrivateRoute>
                      <UserFavorites />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookings/new/:listingId"
                  element={
                    <PrivateRoute>
                      <BookingForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookings/confirmation/:bookingId"
                  element={
                    <PrivateRoute>
                      <BookingConfirmation />
                    </PrivateRoute>
                  }
                />

                {/* Owner Routes - Requires owner role */}
                <Route
                  path="/dashboard"
                  element={
                    <OwnerRoute>
                      <DashboardLayout>
                        <OwnerDashboard />
                      </DashboardLayout>
                    </OwnerRoute>
                  }
                />
                <Route
                  path="/dashboard/listings"
                  element={
                    <OwnerRoute>
                      <DashboardLayout>
                        <OwnerListings />
                      </DashboardLayout>
                    </OwnerRoute>
                  }
                />
                <Route
                  path="/dashboard/listings/create"
                  element={
                    <OwnerRoute>
                      <DashboardLayout>
                        <CreateListing />
                      </DashboardLayout>
                    </OwnerRoute>
                  }
                />
                <Route
                  path="/dashboard/listings/edit/:id"
                  element={
                    <OwnerRoute>
                      <DashboardLayout>
                        <CreateListing />
                      </DashboardLayout>
                    </OwnerRoute>
                  }
                />
                <Route
                  path="/dashboard/bookings"
                  element={
                    <OwnerRoute>
                      <DashboardLayout>
                        <OwnerBookings />
                      </DashboardLayout>
                    </OwnerRoute>
                  }
                />

                {/* Catch all route */}
                <Route
                  path="*"
                  element={<Navigate to="/not-found" replace />}
                />
              </Routes>
            </LocationProvider>
          </ListingProvider>
        </BrowserRouter>
      </Suspense>
    </>
  );
};

export default App;
