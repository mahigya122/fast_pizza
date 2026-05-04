import { useApp } from "../../store.tsx";                                //useApp → access global state + dispatch
import UpdateItemQuantity from "../cart/UpdateItemQuantity";                        //UpdateItemQuantity → component to increase/decrease quantity
import type { Pizza } from "../../types.ts";

type MenuItemProps = {
  pizza: Pizza;
};

export default function MenuItem({ pizza }: MenuItemProps) {                             //This component receives a pizza object. like pizza = {id: 1, name: "Margherita", unitPrice: 12, ingredients: ["cheese", "tomato"] }
  const { state, dispatch } = useApp();                                         // //state.cart → all cart items,dispatch → update cart

  const cartItem = state.cart.find((item) => item.id === pizza.id);                 //If found → returns that item, If not → returns undefined

  function handleAdd() {                                                 //When clicked: Sends action to reducer Adds item to cart with quantity = 1
    dispatch({
      type: "cart/addItem",
      payload: {
        id: pizza.id,
        name: pizza.name,
        price: pizza.unitPrice,
        quantity: 1,
      },
    });
  }

  return (
    <div className="menu-item-card">
      <div className="menu-item-left">
        <img
          src={pizza.imageUrl ?? "https://placehold.co/96x96/f3ebe1/2f211c?text=Pizza"}
          alt={pizza.name}
          className="menu-item-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/96x96/f3ebe1/2f211c?text=Pizza";
          }}
        />

        <div>
          <h3 className="menu-item-title">{pizza.name}</h3>
          <p className="menu-item-meta">
            {pizza.ingredients.join(", ")}
          </p>
          <p className="menu-item-price">${pizza.unitPrice}</p>
        </div>
      </div>

      <div className="menu-item-actions">
        {pizza.soldOut ? (
          <span className="sold-out-chip">Sold out</span>
        ) : !cartItem ? (
          <button
            onClick={handleAdd}
            className="primary-btn"
          >
            Add to cart
          </button>
        ) : (
          <UpdateItemQuantity item={cartItem} />
        )}
      </div>
    </div>
  );
}