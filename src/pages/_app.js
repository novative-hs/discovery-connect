import { ToastContainer } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Provider } from "react-redux";
import { store } from "src/redux/store";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/index.scss";

if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
      <ToastContainer />
    </Provider>
  );
}

export default MyApp;
