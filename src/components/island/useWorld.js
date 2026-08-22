import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

// Loads the current user's world (creating a default one if none exists yet)
// and all memories that belong to it.
export default function useWorld() {
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!appParams.appId) {
          throw new Error(
            "Missing VITE_BASE44_APP_ID. Create .env from .env.example, add your Base44 app id, then restart npm run dev.",
          );
        }
        const me = await base44.auth.me();
        let worlds = await base44.entities.World.filter({
          created_by_id: me.id,
        });
        let w = worlds[0];
        if (!w) {
          w = await base44.entities.World.create({
            name: "My Memory World",
            slug: "world-" + me.id,
            character_color: "#E24B4B",
            is_public: false,
          });
        }
        if (cancelled) return;
        setWorld(w);
        const mems = await base44.entities.Memory.filter({ world_id: w.id });
        if (cancelled) return;
        setMemories(mems);
      } catch (e) {
        setError(e && e.message ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { world, memories, setMemories, setWorld, loading, error };
}
