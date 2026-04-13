import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sfxChestShake, sfxChestOpen, sfxWin } from '@/lib/sfx';

interface TreasureChestRevealProps {
  open: boolean;
  noorAmount: number;
  onClose: () => void;
}

export function TreasureChestReveal({ open, noorAmount, onClose }: TreasureChestRevealProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'shake' | 'open' | 'reveal'>('shake');

  useEffect(() => {
    if (!open) {
      setPhase('shake');
      return;
    }
    sfxChestShake();
    const t1 = setTimeout(() => { setPhase('open'); sfxChestOpen(); }, 1200);
    const t2 = setTimeout(() => { setPhase('reveal'); sfxWin(); }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30 [&>button]:hidden">
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Chest */}
          <div className="relative">
            <div
              className={`text-8xl transition-transform duration-500 ${
                phase === 'shake' ? 'animate-[chest-shake_0.3s_ease-in-out_infinite]' :
                phase === 'open' ? 'scale-110' : 'scale-100'
              }`}
            >
              {phase === 'shake' ? '📦' : '🎁'}
            </div>

            {/* Glow effect on reveal */}
            {phase === 'reveal' && (
              <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 animate-ping" />
            )}
          </div>

          {/* Particles on reveal */}
          {phase === 'reveal' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-lg animate-[particle-fly_1.5s_ease-out_forwards]"
                  style={{
                    left: '50%',
                    top: '40%',
                    animationDelay: `${i * 0.08}s`,
                    ['--angle' as string]: `${(i * 30)}deg`,
                  }}
                >
                  ✨
                </span>
              ))}
            </div>
          )}

          {phase === 'reveal' ? (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  🎉 Congratulations!
                </h2>
                <p className="text-3xl font-extrabold text-primary">
                  You won {noorAmount} NOOR!
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Sign in to your dashboard to claim your reward. You can trade NOOR with any other token!
                </p>
              </div>

              <Button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="gap-2 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-primary-foreground font-bold px-8"
              >
                🚀 Go to Dashboard
              </Button>
            </>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground animate-pulse">
              {phase === 'shake' ? 'Opening your treasure...' : 'Almost there...'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
