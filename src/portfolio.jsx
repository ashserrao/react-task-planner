import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { Routes, Route, useLocation } from "react-router-dom";

// Component imports
import Home from "./Components/home";
import Navbar from "./Components/navbar";
import Login from "./Components/authentication/login";
import Signup from "./Components/authentication/signup";
import ProjectPlanner from "./Components/projecttracker";
import ToDoList from "./Components/todo";
import TimePlanner from "./Components/timeplanner";
import DevResAdmin from "./Components/devresadmin";
import Notifications from "./Components/notifications";
import NecDoc from "./Components/necdoc";
import PrivateRoute from "./Components/authentication/PrivateRoute";
import AdminRoute from "./Components/authentication/AdminRoute";

const Portfolio = () => {
  const location = useLocation();

  const hideNav =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-[#000000] text-[#c2ccaa]">
      {!hideNav && <Navbar />}

      {/* Routes */}
      <main className="min-w-0 flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/time-planner" element={<TimePlanner />} />
            <Route path="/project-track" element={<ProjectPlanner />} />
            <Route path="/todo-list" element={<ToDoList />} />
            <Route element={<AdminRoute />}>
              <Route path="/nec-doc" element={<NecDoc />} />
              <Route path="/dev-res-admin" element={<DevResAdmin />} />
            </Route>
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-40 bg-[#000000] text-[#c2ccaa] border-t border-[#c2ccaa]/10">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center sm:px-6">
          <div className="mt-1">
            &copy; 2026{" "}
            <span>
              <strong>
                <a
                  href="https://ashserrao.github.io/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#67C7EB] transition-colors"
                >
                  Ashtro Dev
                </a>
              </strong>
            </span>
            . v2.0.11 All rights reserved.
          </div>
          <div className="flex justify-center space-x-5 sm:ml-2">
            <motion.a
              href="https://github.com/ashserrao"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-[#67C7EB] transition-colors"
            >
              <FaGithub className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/anush-serrao-31440a16a/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-[#67C7EB] transition-colors"
            >
              <FaLinkedin className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://www.facebook.com/profile.php?id=100009259891356"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-[#67C7EB] transition-colors"
            >
              <FaFacebook className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://www.instagram.com/cipher_beast/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-[#67C7EB] transition-colors"
            >
              <FaInstagram className="w-6 h-6" />
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
