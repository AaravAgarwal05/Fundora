import { motion } from "framer-motion";
import { useRouter } from "next/router";
import TypingText from "../components/TypingText";

export default function HomeHero() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center text-center text-white overflow-hidden">

      {/* AURORA BACKGROUND */}
      <div className="aurora-bg" />

      {/* CONTENT */}
      <div className="z-10 max-w-3xl px-6">

        {/* FLOATING LOGO */}
        <motion.img
          src="/logo.png"
          alt="Fundora"
          className="mx-auto w-36 h-36 rounded-full bg-white p-4 shadow-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* TITLE */}
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="mt-4 text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text"
  style={{
    backgroundImage:
      "linear-gradient(90deg, #3b82f6, #22d3ee, #a855f7, #3b82f6)",
    backgroundSize: "300% 100%",
  }}
>
  <motion.span
    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "linear",
    }}
    className="block bg-inherit bg-clip-text"
  >
    Fundora
  </motion.span>
</motion.h1>


        {/* TAGLINE (WORD REVEAL) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-xl md:text-2xl text-slate-300"

        >
          <TypingText
            text="Fund ideas. Fuel innovation. Empower creators to build the future together."
          />
        </motion.p>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
         className="mt-2 text-base text-slate-400"

        >
          Where ideas rise, communities unite, and the future is funded together.
        </motion.p>

        {/* CTA BUTTON */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ["0 0 0px #2563eb", "0 0 25px #2563eb", "0 0 0px #2563eb"] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          onClick={() => router.push("/explore")}
          className="mt-10 px-8 py-4 rounded-full bg-blue-600 text-lg font-semibold shadow-xl"
        >
          Let’s Contribute Together for the Future
        </motion.button>
      </div>
    </div>
  );
}
