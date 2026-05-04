import type { Pizza } from "../types.ts";

const API_URL = "https://react-fast-pizza-api.onrender.com/api";                           //This is the server address. All our API calls will be made to this URL. We use a variable here so that if the server address changes in the future, we only need to update it in one place instead of every single API call throughout the code.
                                                                              //Instead of repeating full URLs everywhere, you use: ${API_URL}/menu, ${API_URL}/order etc. This makes the code cleaner and easier to maintain.
// ---------------- MENU ----------------
export async function getMenu(): Promise<Pizza[]> {                                     //Fetches list of all pizzas from backend
  const res = await fetch(`${API_URL}/menu`);                          //it sends GET request to: /api/menu
  if (!res.ok) throw new Error("Failed to load menu");               //If server fails → throw error

  const data = (await res.json()) as { data: Pizza[] };                                       // if not Returns actual menu items
  return data.data;
}

// ---------------- GET SINGLE ORDER ----------------
export async function getOrder(id: string | number) {                                       //Gets one order by ID
  const res = await fetch(`${API_URL}/order/${id}`);                                  ///order/12345

  if (!res.ok) {
    throw new Error("Order not found");
  }

  const data = (await res.json()) as { data: unknown };
  return data.data;                                                   //If order exists:
}

// ---------------- CREATE ORDER ----------------
export async function createOrder(newOrder: Record<string, unknown>) {                                        //Sends new order to backend
  const res = await fetch(`${API_URL}/order`, {
    method: "POST",
    body: JSON.stringify(newOrder),                                         //Tell server format: JSON.stringify() converts the newOrder JavaScript object into a JSON string, which is the format expected by the server. This allows the server to parse the order details correctly when it receives the request.
    headers: {
      "Content-Type": "application/json",                                   //This tells the server that we're sending JSON data in the request body. The server will then parse this JSON to get the order details. If we didn't set this header, the server might not understand the data format and could reject the request or fail to process it correctly.
    },
  });

  if (!res.ok) {
    throw new Error("Failed to create order");
  }

  const data = (await res.json()) as { data: unknown };
  return data.data;
}

// ---------------- UPDATE ORDER ----------------
export async function updateOrder(id: string | number, updateObj: Record<string, unknown>) {                                            //Updates existing order partially
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateObj),                                                     //PATCH is used for partial updates. For example, if you only want to update the order status to "delivered", you can send { status: "delivered" } in the updateObj without needing to resend the entire order details.
    headers: {
      "Content-Type": "application/json",                                                           //This tells the server that we're sending JSON data in the request body. The server will then parse this JSON to get the update details. If we didn't set this header, the server might not understand the data format and could reject the request or fail to process it correctly.
    },
  });

  if (!res.ok) throw new Error("Failed to update order");                                       //If server fails → throw error

  const data = (await res.json()) as { data: unknown };
  return data.data;                                                                                  //Returns the updated order details from the server after a successful update. This allows the frontend to have the latest order information, including any changes made by the update.
}
