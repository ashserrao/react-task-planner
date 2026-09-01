import React, { useState } from "react";
import { motion } from "framer-motion";
import HiveBackground from "./HiveBackground";
import HobbyTracker from "./hobbytracker";

const Home = () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzxrRvX7S2Jh6QOHeeTWaCzTiitdn9Y49CUcI4FZh9MJdnEC_VtF9k04jshmkRavUw/exec";

  const [allTasksState, setAllTasksState] = useState([]);

  return (
    <section
      id="home"
      className="min-h-screen relative overflow-hidden"
    >
      <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
      <HobbyTracker />
    </section>
  );
};

export default Home;
