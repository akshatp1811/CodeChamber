import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Landing from '../../pages/Landing';
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import Solo from '../../pages/Solo';
import ChamberCreate from '../../pages/ChamberCreate';
import ChamberRoom from '../../pages/ChamberRoom';
import Leaderboard from '../../pages/Leaderboard';
import Profile from '../../pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null; // Or a loading spinner
    if (!user) return <Navigate to="/login" replace />;

    return children;
};

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route index element={<Landing />} />
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="solo" element={<ProtectedRoute><Solo /></ProtectedRoute>} />
                <Route path="chamber">
                    <Route path="create" element={<ProtectedRoute><ChamberCreate /></ProtectedRoute>} />
                    <Route path=":id" element={<ProtectedRoute><ChamberRoom /></ProtectedRoute>} />
                </Route>
                <Route path="leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;

