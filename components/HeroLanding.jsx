import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function HeroLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center
                    bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">

      {/* Floating Logo */}
      <motion.img
        src="/logo.png"
        alt="Fundora"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-36 h-36 rounded-full shadow-2xl mb-6"
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-extrabold text-white"
      >
        Fundora
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-slate-300 max-w-xl"
      >
        Fund ideas. Fuel innovation. Empower creators to build the future together.

        Where ideas rise, communities unite, and the future is funded together.
      </motion.p>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/explore")}
        className="mt-10 px-8 py-4 rounded-full bg-blue-600 text-white
                   text-lg font-semibold shadow-lg hover:bg-blue-500 transition"
      >
        Let’s Contribute Together for the Future
      </motion.button>
    </div>
  );
}
