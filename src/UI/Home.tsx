import CreateUser from "../features/user/CreateUser";

export default function Home() {                            //Used to move to another route: navigate("/menu") → takes user to menu page
  return (
    <div className="hero-card">
      <p className="eyebrow">Fast. Fresh. Reliable.</p>
      <h1 className="hero-title">
        Welcome to Pizza.co 🍕
      </h1>

      <p className="hero-subtitle">
        Fresh pizza, fast delivery.
      </p>

      <CreateUser />
    </div>
  );
}