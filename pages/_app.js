import "@/styles/globals.css";
import "../styles/aurora.css";
import AnimatedBackground from "../components/AnimatedBackground";
import { FollowProvider } from "../context/FollowContext";
import Script from "next/script";

<Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="beforeInteractive"
/>

export default function App({ Component, pageProps }) {
  return (
    <FollowProvider>
      <AnimatedBackground />
      <Component {...pageProps} />
    </FollowProvider>
  );
}
