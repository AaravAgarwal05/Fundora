import "@/styles/globals.css";
import AnimatedBackground from "../components/AnimatedBackground";
import { FollowProvider } from "../context/FollowContext";

export default function App({ Component, pageProps }) {
  return (
    <FollowProvider>
      <AnimatedBackground />
      <Component {...pageProps} />
    </FollowProvider>
  );
}
