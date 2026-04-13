import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Check, Clock, Sparkles } from 'lucide-react';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export function DailyMissions() {
  const { isAuthenticated } = useAuthContext();
  const { missions, isLoading, completeMission, completedCount, progress, totalMissions } = useDailyMissions();

  if (!isAuthenticated || isLoading) return null;

  const handleComplete = async (id: string, title: string) => {
    const success = await completeMission(id);
    if (success) toast.success(`✅ Mission complete: ${title}`);
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Daily Missions
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {completedCount}/{totalMissions}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              mission.is_completed
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
            }`}
          >
            <div className={`p-2 rounded-full ${mission.is_completed ? 'bg-green-500/20' : 'bg-primary/10'}`}>
              {mission.is_completed ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Clock className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${mission.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {mission.title}
              </p>
              {mission.description && (
                <p className="text-xs text-muted-foreground truncate">{mission.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-primary">+{mission.reward_noor} NOOR</span>
              {!mission.is_completed && (
                <Button size="sm" variant="ghost" onClick={() => handleComplete(mission.id, mission.title)}>
                  Done
                </Button>
              )}
            </div>
          </div>
        ))}
        {completedCount === totalMissions && totalMissions > 0 && (
          <div className="text-center py-2 text-sm text-green-400 font-medium">
            🎉 All missions completed! Come back tomorrow for more.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
