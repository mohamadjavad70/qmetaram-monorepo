import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface VortexPoint {
  x: number;
  y: number;
  phase: number;
  timestamp: string;
  pnl: number;
}

const VORTEX_TARGET = 9.0;
const PHASES = { 3: 'جمع‌آوری', 6: 'هارمونی', 9: 'تعالی' };

export default function MowlanaVortexChart() {
  const [snapshots, setSnapshots] = useState<Array<{ pnl_snapshot: number; snapshot_at: string }>>([]);
  const [latestIntel, setLatestIntel] = useState<{ sentiment_score?: number; vortex_phase?: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Get Mowlana agent
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('id, pnl_percent, current_balance')
        .eq('slug', 'molana')
        .single();

      if (!agent) return;

      // Get race snapshots for spiral visualization
      const { data: snaps } = await supabase
        .from('ai_race_snapshots')
        .select('pnl_snapshot, snapshot_at')
        .eq('agent_id', agent.id)
        .order('snapshot_at', { ascending: true })
        .limit(50);

      if (snaps) setSnapshots(snaps);

      // Get latest trading intelligence
      const { data: intel } = await supabase
        .from('trading_intelligence')
        .select('indicators')
        .eq('agent_name', 'Mowlana')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (intel?.indicators && typeof intel.indicators === 'object' && !Array.isArray(intel.indicators)) {
        const indicators = intel.indicators as Record<string, unknown>;
        setLatestIntel({
          sentiment_score: typeof indicators.sentiment_score === 'number' ? indicators.sentiment_score : undefined,
          vortex_phase: typeof indicators.vortex_phase === 'number' ? indicators.vortex_phase : undefined,
        });
      }
    }
    fetchData();
  }, []);

  // Generate spiral points from snapshots
  const spiralPoints = useMemo(() => {
    if (snapshots.length === 0) {
      // Generate demo spiral
      const points: VortexPoint[] = [];
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 6; // 3 full rotations
        const radius = 30 + (i / 60) * 100; // expanding spiral
        const phase = i % 9 < 3 ? 3 : i % 9 < 6 ? 6 : 9;
        points.push({
          x: 170 + radius * Math.cos(angle),
          y: 170 + radius * Math.sin(angle),
          phase,
          timestamp: '',
          pnl: (i / 60) * VORTEX_TARGET,
        });
      }
      return points;
    }

    return snapshots.map((snap, i) => {
      const angle = (i / snapshots.length) * Math.PI * 4;
      const normalizedPnl = Math.max(0, (snap.pnl_snapshot / 30000) * VORTEX_TARGET);
      const radius = 30 + (normalizedPnl / VORTEX_TARGET) * 120;
      const phase = i % 9 < 3 ? 3 : i % 9 < 6 ? 6 : 9;
      return {
        x: 170 + radius * Math.cos(angle),
        y: 170 + radius * Math.sin(angle),
        phase,
        timestamp: snap.snapshot_at,
        pnl: normalizedPnl,
      };
    });
  }, [snapshots]);

  const currentPhase = latestIntel?.vortex_phase || (new Date().getUTCHours() % 9 < 3 ? 3 : new Date().getUTCHours() % 9 < 6 ? 6 : 9);
  const sentimentScore = latestIntel?.sentiment_score || 5;

  // Build SVG path from spiral points
  const pathData = spiralPoints.length > 1
    ? `M ${spiralPoints[0].x} ${spiralPoints[0].y} ` + spiralPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const getPhaseColor = (phase: number) => {
    if (phase === 3) return 'hsl(var(--chart-1))';
    if (phase === 6) return 'hsl(var(--chart-2))';
    return 'hsl(var(--chart-3))';
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🌀 گرداب مولانا
            <span className="text-sm text-muted-foreground font-normal">Vortex 3-6-9</span>
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={currentPhase === 9 ? 'default' : 'secondary'} className="text-xs">
              فاز {currentPhase}: {PHASES[currentPhase as keyof typeof PHASES]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              احساسات: {sentimentScore}/10
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* SVG Spiral Visualization */}
          <svg viewBox="0 0 340 340" className="w-full max-w-[340px] mx-auto" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))' }}>
            {/* Background circles for 3-6-9 orbits */}
            <circle cx="170" cy="170" r="50" fill="none" stroke="hsl(var(--chart-1) / 0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="170" cy="170" r="100" fill="none" stroke="hsl(var(--chart-2) / 0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="170" cy="170" r="150" fill="none" stroke="hsl(var(--chart-3) / 0.15)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Phase labels */}
            <text x="170" y="118" textAnchor="middle" className="fill-muted-foreground text-[10px]">۳</text>
            <text x="170" y="68" textAnchor="middle" className="fill-muted-foreground text-[10px]">۶</text>
            <text x="170" y="18" textAnchor="middle" className="fill-muted-foreground text-[10px]">۹</text>

            {/* Spiral path */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="url(#vortexGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}

            {/* Colored dots for phase transitions */}
            {spiralPoints.filter((_, i) => i % 3 === 0).map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={point.phase === 9 ? 4 : 2.5}
                fill={getPhaseColor(point.phase)}
                opacity={0.8}
              />
            ))}

            {/* Current position (last point) */}
            {spiralPoints.length > 0 && (
              <>
                <circle
                  cx={spiralPoints[spiralPoints.length - 1].x}
                  cy={spiralPoints[spiralPoints.length - 1].y}
                  r="6"
                  fill="hsl(var(--primary))"
                  className="animate-pulse"
                />
                <circle
                  cx={spiralPoints[spiralPoints.length - 1].x}
                  cy={spiralPoints[spiralPoints.length - 1].y}
                  r="12"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  opacity="0.4"
                  className="animate-pulse"
                />
              </>
            )}

            {/* Target: 9 at center-top */}
            <text x="170" y="12" textAnchor="middle" className="fill-primary font-bold text-sm">
              ۹ ∞
            </text>

            {/* Center label */}
            <text x="170" y="168" textAnchor="middle" className="fill-foreground text-xs font-medium">
              🌀
            </text>
            <text x="170" y="182" textAnchor="middle" className="fill-muted-foreground text-[9px]">
              مولانا
            </text>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="vortexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                <stop offset="50%" stopColor="hsl(var(--chart-2))" />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--chart-1))' }} />
              فاز ۳
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--chart-2))' }} />
              فاز ۶
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--chart-3))' }} />
              فاز ۹
            </span>
            <span className="flex items-center gap-1">
              ضریب: <span className="font-mono text-foreground">0.369</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
