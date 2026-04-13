import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ShieldAlert, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const AdminLoginEvents = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['login-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const suspiciousCount = events?.filter(e => e.is_suspicious).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{events?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-card/50 backdrop-blur ${suspiciousCount > 0 ? 'border-red-500/50' : 'border-border/50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className={`h-5 w-5 ${suspiciousCount > 0 ? 'text-red-400' : 'text-green-400'}`} />
              <div>
                <p className="text-2xl font-bold">{suspiciousCount}</p>
                <p className="text-sm text-muted-foreground">Suspicious</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(events?.map(e => e.user_id)).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Alerts */}
      {suspiciousCount > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Suspicious Entry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events?.filter(e => e.is_suspicious).map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div>
                    <p className="text-sm font-medium">User: {ev.user_id.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">{ev.suspicious_reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {ev.country && `${ev.city ?? ''} ${ev.country}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ev.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Entry Events Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events && events.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(ev => (
                    <TableRow key={ev.id} className={ev.is_suspicious ? 'bg-red-500/5' : ''}>
                      <TableCell className="font-mono text-xs">
                        {ev.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-xs">{ev.ip_address ?? '—'}</TableCell>
                      <TableCell className="text-xs">
                        {ev.country ? `${ev.city ?? ''} ${ev.country}` : '—'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {ev.user_agent?.substring(0, 40) ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ev.is_suspicious ? 'destructive' : 'default'}>
                          {ev.is_suspicious ? 'Suspicious' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(ev.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No login events recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
