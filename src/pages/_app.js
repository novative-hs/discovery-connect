import { useState, useEffect } from "react";  // useEffect add karein
import { ToastContainer } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Provider } from "react-redux";
import { store } from "src/redux/store";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css"; // AOS CSS
import "../styles/index.scss";

import AOS from "aos"; // AOS import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true, // ek hi dafa chale
    });
  }, []);

  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </Elements>
      <ToastContainer />
    </Provider>
  );
}

export default MyApp;
