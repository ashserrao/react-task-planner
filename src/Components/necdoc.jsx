import React from "react";

function NecDoc() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-[#c2ccaa]">
      <h1>Notes</h1>
      <a
        href="https://docs.google.com/document/d/1YI_R4m_rr6TnaQ9K3qSY26MExzZiM2dJlJwaXSVM438/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Open Nec Doc
      </a>
    </div>
  );
}

export default NecDoc;
