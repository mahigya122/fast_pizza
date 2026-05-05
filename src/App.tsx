import { RouterProvider } from "react-router-dom";                 
import { router } from "./router";                                                     

export default function App() {                                //This makes routing work across your app.
  return <RouterProvider router={router} />;
}