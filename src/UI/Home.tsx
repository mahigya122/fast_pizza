import { useState } from "react";                                //useState → manages input (name)
import { useApp } from "../store";                               // custom global state hook useApp → to access global state and dispatch actions
import { useNavigate } from "react-router-dom";                // useNavigate → used to redirect to another page

export default function Home() {
  const [name, setName] = useState("");                        //Stores what user types in the name input. i.e. Example: "Alice"
  const { dispatch } = useApp();                               //This connects to your global store and gives you the dispatch function to send actions that update the global state.
  const navigate = useNavigate();                                //Used to move to another route: navigate("/menu") → takes user to menu page

  function handleStart() {
    if (!name) return;                                         //If name is empty → stop

    dispatch({                                                   //Save name in global state so we can use it across the app. This is useful for personalizing the experience (like: "Welcome, Alice!"). The reducer in your global store will listen for this action type and update the state with the provided name.
      type: "user/setUsername",        
      payload: name,
    });

    navigate("/menu");                                        // Redirect user to: menu page
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Pizza.co 🍕
      </h1>

      <p className="mb-6 text-gray-600">
        Fresh pizza, fast delivery.
      </p>

      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}                            //Controlled input: value = state, onChange = updates state
          className="border px-3 py-2 rounded"
        />

        {name && (                                                      //Button only shows when: user has typed their name. This encourages them to enter their name before starting the order.
          <button
            onClick={handleStart}
            className="bg-yellow-400 px-4 py-2 rounded font-semibold"
          >
            Start Ordering
          </button>
        )}
      </div>
    </div>
  );
}