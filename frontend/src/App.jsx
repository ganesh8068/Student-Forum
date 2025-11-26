import React from "react";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Resources from "./pages/Resources";

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
  );
};

export default App;
