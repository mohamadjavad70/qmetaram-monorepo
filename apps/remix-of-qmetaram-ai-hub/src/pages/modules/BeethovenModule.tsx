import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { checkModuleAccess } from "@/lib/checkAccess";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from "lucide-react";

const fakeTracks = [
  { name: "Track 1 — Synth Lead", color: "bg-beethoven/30", width: "w-[80%]" },
  { name: "Track 2 — Bass", color: "bg-primary/30", width: "w-[65%]" },
  { name: "Track 3 — Drums", color: "bg-secondary/30", width: "w-[90%]" },
  { name: "Track 4 — Pad", color: "bg-accent/30", width: "w-[50%]" },
];

export default function BeethovenModule() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    checkModuleAccess().then((ok) => {
      if (!ok) navigate("/pricing?upgrade=true", { replace: true });
      else setAccessChecked(true);
    });
  }, [navigate]);

  if (!accessChecked) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-orbitron text-lg font-bold text-beethoven mb-6">🎵 بتهوون — استودیو موسیقی</h2>

          {/* Transport Controls */}
          <Card className="glass-strong p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon"><SkipBack className="w-5 h-5" /></Button>
              <Button onClick={() => setPlaying(!playing)} size="icon" className="bg-beethoven hover:bg-beethoven/80 w-12 h-12 rounded-full">
                {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon"><SkipForward className="w-5 h-5" /></Button>
              <div className="ml-6 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="w-24 h-2 rounded-full bg-muted">
                  <div className="w-[70%] h-full rounded-full bg-beethoven" />
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-4">00:00 / 03:45</span>
            </div>
          </Card>

          {/* Tracks */}
          <div className="space-y-3">
            {fakeTracks.map((track, i) => (
              <motion.div key={track.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass p-3 flex items-center gap-4">
                  <Music className="w-5 h-5 text-beethoven shrink-0" />
                  <span className="text-sm font-mono w-40 shrink-0">{track.name}</span>
                  <div className="flex-1 h-8 rounded bg-muted/50 relative overflow-hidden">
                    <div className={`${track.color} ${track.width} h-full rounded`}>
                      {playing && (
                        <motion.div animate={{ x: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="w-0.5 h-full bg-foreground absolute top-0" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            این یک نمای پیش‌فرض استودیو است. در نسخه‌های بعدی قابلیت تولید موسیقی با AI اضافه خواهد شد.
          </p>
        </div>
      </main>
    </div>
  );
}
