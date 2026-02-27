import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from '../../pages/Landing';
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import Solo from '../../pages/Solo';
import ChamberCreate from '../../pages/ChamberCreate';
import ChamberRoom from '../../pages/ChamberRoom';
import Leaderboard from '../../pages/Leaderboard';
import Profile from '../../pages/Profile';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route index element={<Landing />} />
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="solo" element={<Solo />} />
                <Route path="chamber">
                    <Route path="create" element={<ChamberCreate />} />
                    <Route path=":id" element={<ChamberRoom />} />
                </Route>
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
