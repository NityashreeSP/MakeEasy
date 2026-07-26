import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import SavedPlaces from "./pages/SavedPlaces/SavedPlaces";
import MyTrips from "./pages/MyTrips/MyTrips";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* Landing Page */}
                <Route
                    path="/"
                    element={<Landing />}
                />

                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Saved Places */}
                <Route
                    path="/saved"
                    element={
                        <ProtectedRoute>
                            <SavedPlaces />
                        </ProtectedRoute>
                    }
                />

                {/* My Saved Trips */}
                <Route
                    path="/my-trips"
                    element={
                        <ProtectedRoute>
                            <MyTrips />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;