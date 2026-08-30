import React, { cloneElement, createContext, useContext } from "react";

const CollapsibleContext = createContext(null);

export function Collapsible({ open, onOpenChange, children }) {
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ asChild, children, ...props }) {
  const { open, onOpenChange } = useContext(CollapsibleContext);
  const onClick = (event) => {
    children.props?.onClick?.(event);
    props.onClick?.(event);
    onOpenChange?.(!open);
  };

  if (asChild) {
    return cloneElement(children, { ...props, onClick });
  }

  return (
    <button type="button" {...props} onClick={onClick}>
      {children}
    </button>
  );
}

export function CollapsibleContent({ children }) {
  const { open } = useContext(CollapsibleContext);
  if (!open) return null;
  return <>{children}</>;
}
