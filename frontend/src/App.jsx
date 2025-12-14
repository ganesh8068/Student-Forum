import React from "react";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Resources from "./pages/Resources";
import DiscussionRoom from "./pages/DiscussionRoom";
import AboutUs from "./pages/AboutUs";


const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/discussion-room" element={<DiscussionRoom />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
  );
};

export default App;
