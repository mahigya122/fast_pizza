import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { addItem, increaseQty } from "../../redux/cartSlice";
import UpdateItemQuantity from "../cart/UpdateItemQuantity";
import type { Pizza } from "../../types";

type MenuItemProps = {
  pizza: Pizza;
};

export default function MenuItem({ pizza }: MenuItemProps) {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const cartItem = cart.find((item) => item.id === pizza.id);

  function handleAdd() {
    dispatch(
      addItem({
        id: pizza.id,
        name: pizza.name,
        price: pizza.unitPrice,
        quantity: 1,
      })
    );
  }

  return (
    <div className="menu-item-card">
      {/*This is the whole pizza card.*/}
      <div className="menu-item-left">
        {/*This contains the image and pizza details.*/}
        <img
          src={pizza.imageUrl ?? "https://placehold.co/96x96/f3ebe1/2f211c?text=Pizza"}
          alt={pizza.name}
          className="menu-item-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/96x96/f3ebe1/2f211c?text=Pizza";
          }}
        />
        {/*If image exists → use it, If not → use placeholder image, ?? means:“if null or undefined, use fallback”*/}
        {/*If image fails to load: replace it with fallback image */}

        <div>
          <h3 className="menu-item-title">{pizza.name}</h3>
          <p className="menu-item-meta">
            {pizza.ingredients.join(", ")}
          </p>
          <p className="menu-item-price">${pizza.unitPrice}</p>
        </div>
      </div>

      <div className="menu-item-actions">
        {/*This controls what button shows*/}
        {pizza.soldOut ? (
          <>
            {/*If pizza is unavailable:show "Sold out", no button */}
            <span className="sold-out-chip">Sold out</span>
          </>
        ) : !cartItem ? (
          <>
            {/*If item NOT in cart: show Add button, when clicked: adds item to cart with quantity 1 */}
            <button
              onClick={handleAdd}
              className="primary-btn"
            >
              Add to cart
            </button>
          </>
        ) : (
          <UpdateItemQuantity item={cartItem} />
        )}
      </div>
    </div>
  );
}