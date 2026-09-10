import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import {
  NavLink,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Component imports
import Home from "./Components/home";
// import Timeline from "./Components/timeline";
// import CalendarView from "./Components/calendarview";
// import ListView from "./Components/listview";
import Login from "./Components/authentication/login";
import Signup from "./Components/authentication/signup";
import ProjectPlanner from "./Components/projecttracker";
import ToDoList from "./Components/todo";
import TimePlanner from "./Components/timeplanner";
import PrivateRoute from "./Components/authentication/PrivateRoute";
import { useAuth } from "./Components/authentication/AuthContext";

const Portfolio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = [
    { name: "home", label: "home", url: "/" },
    { name: "time-planner", label: "Time Planner", url: "/time-planner" },
    { name: "project-track", label: "Project Track", url: "/project-track" },
    { name: "to-do", label: "To-Do", url: "/todo-list" },
  ];

  const hideNav =
    location.pathname === "/login" || location.pathname === "/signup";

  // Sync active section with current path
  useEffect(() => {
    const current = sections.find((s) => location.pathname.includes(s.name));
    if (current) {
      setActiveSection(current.name);
    }
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-[#000000] text-[#c2ccaa]">
      {!hideNav && (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-black/20 bg-[#6A0C0B]/90 backdrop-blur-md">
          <nav className="container mx-auto flex min-w-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="min-w-0 truncate pr-4 text-xl font-display font-semibold text-[#FFFFFF] sm:text-2xl"
            >
              <NavLink to={"/"}>Ashtro Planner</NavLink>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden items-center space-x-4 md:flex lg:space-x-6">
              {sections.map((section) => (
                <NavLink key={section.name} to={section.url}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`capitalize font-semibold ${
                      activeSection === section.name
                        ? "text-[#8cfcfb]"
                        : "text-[#c2ccaa]"
                    } hover:text-[#67C7EB] transition-colors`}
                  >
                    {section.label}
                  </motion.button>
                </NavLink>
              ))}
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 font-semibold text-[#c2ccaa] hover:text-[#67C7EB] transition-colors"
                >
                  <LogOut className="w-4 h-4" /> logout
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className=" w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {!hideNav && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-40 bg-[#582726] bg-opacity-95 flex flex-col items-center justify-center space-y-6"
          >
            {sections.map((section) => (
              <NavLink
                key={section.name}
                to={section.url}
                onClick={() => {
                  setActiveSection(section.name);
                  setMenuOpen(false);
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-2xl font-bold capitalize ${
                    activeSection === section.name
                      ? "text-[#8cfcfb]"
                      : "text-[#c2ccaa]"
                  } hover:text-[#67C7EB] transition-colors`}
                >
                  {section.label}
                </motion.button>
              </NavLink>
            ))}
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 text-2xl font-bold capitalize text-[#c2ccaa] hover:text-[#67C7EB] transition-colors"
              >
                <LogOut className="w-5 h-5" /> logout
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routes */}
      <main
        className={`min-w-0 flex-1 ${hideNav ? "" : "pt-[4.5rem] sm:pt-24"}`}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/time-planner" element={<TimePlanner />} />
            <Route path="/project-track" element={<ProjectPlanner />} />
            <Route path="/todo-list" element={<ToDoList />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      {!menuOpen && (
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
              . v0.1.2 All rights reserved.
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
      )}
    </div>
  );
};

export default Portfolio;
