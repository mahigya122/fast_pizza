import { Outlet } from "react-router-dom";                  //Outlet → a placeholder for route content
import Header from "./Header";                                // Header → your top navigation (shown on every page)

export default function AppLayout() {                     // created a layout component that servers as a wrapper for all the page in my app. 
  return (
    <div>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}