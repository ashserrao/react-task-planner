import React from "react";

function Divider({ children }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground/60">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default Divider;
