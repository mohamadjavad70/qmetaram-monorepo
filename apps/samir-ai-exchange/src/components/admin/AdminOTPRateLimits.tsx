import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Search, Ban, Activity, AlertTriangle, RefreshCw, Trash2, Clock } from 'lucide-react';

interface OTPRateLimit {
  id: string;
  ip_address: string;
  phone_number: string | null;
  request_type: string;
  created_at: string;
}

interface SuspiciousActivity {
  ip_address: string;
  phone_number: string | null;
  request_count: number;
  first_request: string;
  last_request: string;
  request_type: string;
}

export const AdminOTPRateLimits = () => {
  const [rateLimits, setRateLimits] = useState<OTPRateLimit[]>([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState<SuspiciousActivity[]>([]);
  const [suspiciousPhones, setSuspiciousPhones] = useState<SuspiciousActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests24h: 0,
    uniqueIPs24h: 0,
    uniquePhones24h: 0,
    failedVerifications24h: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const callAdminEndpoint = async (action: string, body?: Record<string, string>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-otp-rate-limits`);
    url.searchParams.set('action', action);

    const response = await fetch(url.toString(), {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Request failed');
    }

    return response.json();
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await callAdminEndpoint('list');
      const rawData = result.data || [];

      const mappedRecords: OTPRateLimit[] = rawData.map((r: any) => ({
        id: r.id,
        ip_address: String(r.ip_address),
        phone_number: r.phone_number,
        request_type: r.request_type,
        created_at: r.created_at,
      }));

      setRateLimits(mappedRecords);

      // Calculate stats
      const uniqueIPs = new Set(mappedRecords.map(r => r.ip_address)).size;
      const uniquePhones = new Set(mappedRecords.filter(r => r.phone_number).map(r => r.phone_number)).size;
      const failedVerifications = mappedRecords.filter(r => r.request_type === 'verify_failed').length;

      setStats({
        totalRequests24h: mappedRecords.length,
        uniqueIPs24h: uniqueIPs,
        uniquePhones24h: uniquePhones,
        failedVerifications24h: failedVerifications,
      });

      // Calculate suspicious IPs (more than 15 requests in 24h)
      const ipCounts: Record<string, { count: number; first: string; last: string; type: string }> = {};
      mappedRecords.forEach(r => {
        if (!ipCounts[r.ip_address]) {
          ipCounts[r.ip_address] = { count: 0, first: r.created_at, last: r.created_at, type: r.request_type };
        }
        ipCounts[r.ip_address].count++;
        if (r.created_at < ipCounts[r.ip_address].first) ipCounts[r.ip_address].first = r.created_at;
        if (r.created_at > ipCounts[r.ip_address].last) ipCounts[r.ip_address].last = r.created_at;
      });

      const suspiciousIPList = Object.entries(ipCounts)
        .filter(([_, data]) => data.count >= 15)
        .map(([ip, data]) => ({
          ip_address: ip,
          phone_number: null,
          request_count: data.count,
          first_request: data.first,
          last_request: data.last,
          request_type: data.type,
        }))
        .sort((a, b) => b.request_count - a.request_count);

      setSuspiciousIPs(suspiciousIPList);

      // Calculate suspicious phones (more than 8 requests in 24h)
      const phoneCounts: Record<string, { count: number; first: string; last: string; ip: string }> = {};
      mappedRecords.filter(r => r.phone_number).forEach(r => {
        const phone = r.phone_number!;
        if (!phoneCounts[phone]) {
          phoneCounts[phone] = { count: 0, first: r.created_at, last: r.created_at, ip: r.ip_address };
        }
        phoneCounts[phone].count++;
        if (r.created_at < phoneCounts[phone].first) phoneCounts[phone].first = r.created_at;
        if (r.created_at > phoneCounts[phone].last) phoneCounts[phone].last = r.created_at;
      });

      const suspiciousPhoneList = Object.entries(phoneCounts)
        .filter(([_, data]) => data.count >= 8)
        .map(([phone, data]) => ({
          ip_address: data.ip,
          phone_number: phone,
          request_count: data.count,
          first_request: data.first,
          last_request: data.last,
          request_type: 'send',
        }))
        .sort((a, b) => b.request_count - a.request_count);

      setSuspiciousPhones(suspiciousPhoneList);

    } catch (error) {
      console.error('Error fetching rate limits:', error);
      toast.error('Failed to fetch rate limit data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearOldRecords = async () => {
    try {
      await callAdminEndpoint('cleanup');
      toast.success('Old rate limit records cleaned up');
      fetchData();
    } catch (error) {
      console.error('Error cleaning up records:', error);
      toast.error('Failed to clean up records');
    }
  };

  const deleteRecordsByIP = async (ip: string) => {
    try {
      await callAdminEndpoint('delete_by_ip', { ip });
      toast.success(`Records for IP ${ip} deleted`);
      fetchData();
    } catch (error) {
      console.error('Error deleting records:', error);
      toast.error('Failed to delete records');
    }
  };

  const deleteRecordsByPhone = async (phone: string) => {
    try {
      await callAdminEndpoint('delete_by_phone', { phone });
      toast.success(`Records for phone ${phone} deleted`);
      fetchData();
    } catch (error) {
      console.error('Error deleting records:', error);
      toast.error('Failed to delete records');
    }
  };

  const filteredLimits = rateLimits.filter(r =>
    r.ip_address?.includes(searchTerm) ||
    r.phone_number?.includes(searchTerm)
  );

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'send':
        return <Badge variant="secondary">Send OTP</Badge>;
      case 'verify':
        return <Badge variant="outline">Verify</Badge>;
      case 'verify_failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          OTP Rate Limits & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Requests (24h)</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRequests24h}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Unique IPs</span>
            </div>
            <p className="text-2xl font-bold">{stats.uniqueIPs24h}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Unique Phones</span>
            </div>
            <p className="text-2xl font-bold">{stats.uniquePhones24h}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">Failed Verifications</span>
            </div>
            <p className="text-2xl font-bold">{stats.failedVerifications24h}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by IP or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearOldRecords} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Old
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="suspicious" className="space-y-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="suspicious" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Suspicious Activity
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              All Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suspicious" className="space-y-4">
            {/* Suspicious IPs */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Ban className="h-4 w-4 text-red-400" />
                Suspicious IPs (15+ requests in 24h)
              </h4>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>IP Address</TableHead>
                      <TableHead>Request Count</TableHead>
                      <TableHead>First Request</TableHead>
                      <TableHead>Last Request</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousIPs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No suspicious IPs detected
                        </TableCell>
                      </TableRow>
                    ) : (
                      suspiciousIPs.map((item) => (
                        <TableRow key={item.ip_address} className="bg-red-500/5">
                          <TableCell className="font-mono">{item.ip_address}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.request_count}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTime(item.first_request)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTime(item.last_request)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRecordsByIP(item.ip_address)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Suspicious Phones */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Suspicious Phones (8+ requests in 24h)
              </h4>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Request Count</TableHead>
                      <TableHead>Last IP</TableHead>
                      <TableHead>First Request</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousPhones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No suspicious phones detected
                        </TableCell>
                      </TableRow>
                    ) : (
                      suspiciousPhones.map((item) => (
                        <TableRow key={item.phone_number} className="bg-yellow-500/5">
                          <TableCell className="font-mono">{item.phone_number}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.request_count}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.ip_address}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTime(item.first_request)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRecordsByPhone(item.phone_number!)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>IP Address</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredLimits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLimits.slice(0, 100).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">{record.ip_address}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.phone_number || '-'}
                        </TableCell>
                        <TableCell>{getRequestTypeBadge(record.request_type)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(record.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
