import React, { useState } from "react";
import { motion } from "framer-motion";
import HiveBackground from "./HiveBackground";

const Home = () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzxrRvX7S2Jh6QOHeeTWaCzTiitdn9Y49CUcI4FZh9MJdnEC_VtF9k04jshmkRavUw/exec";

  const [allTasksState, setAllTasksState] = useState([]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#000000]"
    >
      <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
      Task Planner is ready
    </section>
  );
};

export default Home;
