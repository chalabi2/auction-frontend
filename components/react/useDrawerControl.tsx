import { createContext, ReactNode, useContext } from "react";

const DrawerControlContext = createContext({
  closeDrawer: () => {},
  onDrawerClose: () => {},
});

export const useDrawerControl = () => useContext(DrawerControlContext);

interface DrawerControlProviderProps {
  children: ReactNode;
  closeDrawer: () => void;
  onDrawerClose: () => void;
}

export const DrawerControlProvider = ({
  children,
  closeDrawer,
  onDrawerClose,
}: DrawerControlProviderProps) => {
  return (
    <DrawerControlContext.Provider value={{ closeDrawer, onDrawerClose }}>
      {children}
    </DrawerControlContext.Provider>
  );
};
