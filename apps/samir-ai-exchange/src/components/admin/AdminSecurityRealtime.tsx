import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Ban, 
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  TrendingUp,
  Eye
} from 'lucide-react';

interface LiveEvent {
  id: string;
  ip_address: string;
  phone_number: string | null;
  request_type: string;
  created_at: string;
  isNew?: boolean;
}

interface RealtimeStats {
  totalToday: number;
  lastHour: number;
  failedVerifications: number;
  suspiciousIPs: Set<string>;
  suspiciousPhones: Set<string>;
}

export const AdminSecurityRealtime = () => {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<RealtimeStats>({
    totalToday: 0,
    lastHour: 0,
    failedVerifications: 0,
    suspiciousIPs: new Set(),
    suspiciousPhones: new Set(),
  });
  const [ipCounts, setIpCounts] = useState<Record<string, number>>({});
  const [phoneCounts, setPhoneCounts] = useState<Record<string, number>>({});

  // Calculate suspicious activity
  const updateSuspiciousActivity = useCallback((events: LiveEvent[]) => {
    const newIpCounts: Record<string, number> = {};
    const newPhoneCounts: Record<string, number> = {};
    let failed = 0;

    events.forEach(e => {
      const ip = String(e.ip_address);
      newIpCounts[ip] = (newIpCounts[ip] || 0) + 1;
      if (e.phone_number) {
        newPhoneCounts[e.phone_number] = (newPhoneCounts[e.phone_number] || 0) + 1;
      }
      if (e.request_type === 'verify_failed') {
        failed++;
      }
    });

    setIpCounts(newIpCounts);
    setPhoneCounts(newPhoneCounts);

    const suspiciousIPs = new Set(
      Object.entries(newIpCounts)
        .filter(([_, count]) => count >= 10)
        .map(([ip]) => ip)
    );

    const suspiciousPhones = new Set(
      Object.entries(newPhoneCounts)
        .filter(([_, count]) => count >= 5)
        .map(([phone]) => phone)
    );

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const lastHourCount = events.filter(
      e => new Date(e.created_at).getTime() > oneHourAgo
    ).length;

    setStats({
      totalToday: events.length,
      lastHour: lastHourCount,
      failedVerifications: failed,
      suspiciousIPs,
      suspiciousPhones,
    });
  }, []);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('otp_rate_limits')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const events: LiveEvent[] = (data || []).map(r => ({
        id: r.id,
        ip_address: String(r.ip_address),
        phone_number: r.phone_number,
        request_type: r.request_type,
        created_at: r.created_at,
      }));

      setLiveEvents(events);
      updateSuspiciousActivity(events);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در دریافت اطلاعات');
    }
  }, [updateSuspiciousActivity]);

  // Set up realtime subscription
  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel('security-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'otp_rate_limits'
        },
        (payload) => {
          console.log('New event:', payload);
          
          const newEvent: LiveEvent = {
            id: payload.new.id,
            ip_address: String(payload.new.ip_address),
            phone_number: payload.new.phone_number,
            request_type: payload.new.request_type,
            created_at: payload.new.created_at,
            isNew: true,
          };

          setLiveEvents(prev => {
            const updated = [newEvent, ...prev].slice(0, 100);
            updateSuspiciousActivity(updated);
            return updated;
          });

          // Show toast for suspicious activity
          if (newEvent.request_type === 'verify_failed') {
            toast.warning('تلاش ناموفق تایید OTP', {
              description: `IP: ${newEvent.ip_address}`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData, updateSuspiciousActivity]);

  // Remove "new" flag after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveEvents(prev => prev.map(e => ({ ...e, isNew: false })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [liveEvents]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'send':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">ارسال OTP</Badge>;
      case 'verify':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">تایید موفق</Badge>;
      case 'verify_failed':
        return <Badge variant="destructive">تایید ناموفق</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds} ثانیه پیش`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
    return `${Math.floor(seconds / 3600)} ساعت پیش`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium">
              {isConnected ? 'اتصال برقرار' : 'در حال اتصال...'}
            </h3>
            <p className="text-sm text-muted-foreground">
              به‌روزرسانی خودکار {isConnected ? 'فعال' : 'غیرفعال'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInitialData}>
          <RefreshCw className="h-4 w-4 ml-2" />
          بازنشانی
        </Button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">امروز</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalToday}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">۱ ساعت اخیر</span>
            </div>
            <p className="text-2xl font-bold">{stats.lastHour}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">ناموفق</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.failedVerifications}</p>
          </CardContent>
        </Card>

        <Card className={`bg-card/50 border-border/50 ${stats.suspiciousIPs.size > 0 ? 'ring-2 ring-red-500/50' : ''}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">IP مشکوک</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.suspiciousIPs.size}</p>
          </CardContent>
        </Card>

        <Card className={`bg-card/50 border-border/50 ${stats.suspiciousPhones.size > 0 ? 'ring-2 ring-yellow-500/50' : ''}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">شماره مشکوک</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.suspiciousPhones.size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activity Alerts */}
      {(stats.suspiciousIPs.size > 0 || stats.suspiciousPhones.size > 0) && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              هشدار فعالیت مشکوک
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(stats.suspiciousIPs).map(ip => (
                <div key={ip} className="flex items-center justify-between p-2 bg-red-500/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-red-400" />
                    <span className="font-mono text-sm">{ip}</span>
                  </div>
                  <Badge variant="destructive">{ipCounts[ip]} درخواست</Badge>
                </div>
              ))}
              {Array.from(stats.suspiciousPhones).map(phone => (
                <div key={phone} className="flex items-center justify-between p-2 bg-yellow-500/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-yellow-400" />
                    <span className="font-mono text-sm">{phone}</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {phoneCounts[phone]} درخواست
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Events Feed */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            رویدادهای زنده
            {isConnected && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {liveEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  هنوز رویدادی ثبت نشده است
                </div>
              ) : (
                liveEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all duration-500
                      ${event.isNew 
                        ? 'bg-primary/10 border-primary/30 animate-pulse' 
                        : 'bg-muted/30 border-border/50'
                      }
                      ${event.request_type === 'verify_failed' ? 'border-red-500/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${event.request_type === 'send' ? 'bg-blue-400' : ''}
                        ${event.request_type === 'verify' ? 'bg-green-400' : ''}
                        ${event.request_type === 'verify_failed' ? 'bg-red-400' : ''}
                      `} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{event.ip_address}</span>
                          {event.phone_number && (
                            <span className="text-xs text-muted-foreground">
                              | {event.phone_number}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(event.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getEventBadge(event.request_type)}
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTime(event.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
