import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { sfxSpinStart, sfxSpinTick, sfxWin } from '@/lib/sfx';

const SEGMENTS = Array.from({ length: 19 }, (_, i) => i + 1);
const SEGMENT_ANGLE = 360 / SEGMENTS.length;

// 3-6-9 weighted algorithm
function pickWeightedValue(): number {
  const weighted = [
    ...Array(4).fill(3),
    ...Array(4).fill(6),
    ...Array(4).fill(9),
    1, 2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  ];
  return weighted[Math.floor(Math.random() * weighted.length)];
}

const COLORS = [
  'hsl(45 100% 50%)',   // gold
  'hsl(280 80% 45%)',   // purple
  'hsl(200 90% 50%)',   // blue
  'hsl(340 80% 50%)',   // pink
  'hsl(160 70% 40%)',   // teal
  'hsl(30 90% 50%)',    // orange
];

interface NoorSpinWheelProps {
  open: boolean;
  onResult: (value: number) => void;
}

export function NoorSpinWheel({ open, onResult }: NoorSpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasSpun = useRef(false);

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((val, i) => {
      const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      const isSpecial = [3, 6, 9].includes(val);
      ctx.fillStyle = isSpecial ? 'hsl(45 100% 50%)' : COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'hsl(0 0% 10%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      const textAngle = ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      const textX = center + Math.cos(textAngle) * (radius * 0.7);
      const textY = center + Math.sin(textAngle) * (radius * 0.7);
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = isSpecial ? 'hsl(0 0% 5%)' : 'hsl(0 0% 100%)';
      ctx.font = `bold ${isSpecial ? 16 : 13}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${val}`, 0, 0);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(0 0% 8%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(45 100% 50%)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'hsl(45 100% 50%)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NOOR', center, center);
  }, []);

  // Auto-spin on open
  useEffect(() => {
    if (open && !hasSpun.current) {
      hasSpun.current = true;
      const timer = setTimeout(() => {
        const result = pickWeightedValue();
        const targetSegIndex = SEGMENTS.indexOf(result);
        const targetAngle = targetSegIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
        const finalRotation = fullSpins + (360 - targetAngle);

        setSpinning(true);
        setRotation(finalRotation);
        sfxSpinStart();

        // Tick sounds during spin
        let tickCount = 0;
        const tickInterval = setInterval(() => {
          sfxSpinTick();
          tickCount++;
          if (tickCount > 30) clearInterval(tickInterval);
        }, 120);

        setTimeout(() => {
          clearInterval(tickInterval);
          setSpinning(false);
          sfxWin();
          onResult(result);
        }, 4000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [open, onResult]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30 [&>button]:hidden">
        <div className="flex flex-col items-center gap-4 py-4">
          <h2 className="text-xl font-bold text-foreground">🎰 Spin to Win NOOR!</h2>
          <p className="text-sm text-muted-foreground text-center">
            Your lucky wheel is spinning...
          </p>

          {/* Pointer */}
          <div className="relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
            
            <div
              className="transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: spinning ? '4s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
              }}
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="rounded-full shadow-[0_0_40px_hsl(45_100%_50%/0.3)]"
              />
            </div>
          </div>

          {spinning && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Good luck! ✨
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
