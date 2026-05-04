import {
  createBrowserRouter,                                  //createBrowserRouter → creates route configuration i.e. an array of route objects
  RouterProvider,                                    //RouterProvider → connects router to your app
} from "react-router-dom";

import AppLayout from "./UI/AppLayout";
import Home from "./UI/Home";
import Error from "./UI/Error";
import Menu from "./features/menu/Menu";
import Cart from "./features/cart/Cart";
import CreateOrder from "./features/order/CreateOrder";
import Order from "./features/order/Order";

//it is use to create a router instance with the specified route configuration. The route configuration is an array of route objects, where each object defines a route and its associated component. The router instance created by createBrowserRouter is then passed to the RouterProvider component, which makes the routing functionality available throughout the app.
const router = createBrowserRouter([
  {                                       //So every page renders inside this layout
    element: <AppLayout />,                            //This is the main wrapper layout. Usually contains: Navbar, Footer, <Outlet /> i.e. <Navbar /> <Outlet /> <Footer /> 
    errorElement: <Error />,               //If something goes wrong (like: wrong route, loader error.....etc). React Router shows <Error /> (error component) instead
    children: [
      {
        path: "/",                                         // "/" → homepage
        element: <Home />,                                 // component to render when the path matches.This will render inside <Outlet /> of AppLayout
      },
      {
        path: "/menu",
        element: <Menu />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order/new",
        element: <CreateOrder />,
      },
      {
        path: "/order/:orderId",
        element: <Order />,
      }
    ],
  },
]);
                                  
export default function App() {                                      //This makes routing work across your app.
  return <RouterProvider router={router} />;
}