import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const user = session?.user;

      if (user) {
        // check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.email.split("@")[0], // fallback
            bio: "",
            website: "",
            avatar_url: ""
          });
        }
      }

      router.replace("/");
    }

    handleCallback();
  }, []);

  return (
    <div className="text-white p-10">Finishing login...</div>
  );
}
