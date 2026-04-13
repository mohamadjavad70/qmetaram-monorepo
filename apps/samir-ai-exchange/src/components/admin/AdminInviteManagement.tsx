import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Copy, Ban, Link2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InviteToken {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  is_revoked: boolean;
  used_at: string | null;
}

export function AdminInviteManagement() {
  const { toast } = useToast();
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [expiresDays, setExpiresDays] = useState('7');
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedUrl, setLastCreatedUrl] = useState('');

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('id, email, created_at, expires_at, is_used, is_revoked, used_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setInvites(data);
    }
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({ title: 'Invalid email', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-invite', {
        body: { email, full_name: fullName, expires_days: parseInt(expiresDays) },
      });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create invite', variant: 'destructive' });
      } else if (data?.token) {
        const url = `${window.location.origin}/p/${data.token}`;
        setLastCreatedUrl(url);
        setEmail('');
        setFullName('');
        toast({ title: 'Invite created!', description: `Link generated for ${data.email}` });
        fetchInvites();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lastCreatedUrl);
    toast({ title: 'Copied!', description: 'Invite link copied to clipboard' });
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      const { error } = await supabase.functions.invoke('revoke-invite', {
        body: { invite_id: inviteId },
      });
      if (!error) {
        toast({ title: 'Invite revoked' });
        fetchInvites();
      }
    } catch {
      toast({ title: 'Error revoking invite', variant: 'destructive' });
    }
  };

  const getStatus = (invite: InviteToken) => {
    if (invite.is_revoked) return { label: 'Revoked', variant: 'destructive' as const, icon: XCircle };
    if (invite.is_used) return { label: 'Used', variant: 'secondary' as const, icon: CheckCircle };
    if (new Date(invite.expires_at) < new Date()) return { label: 'Expired', variant: 'outline' as const, icon: Clock };
    return { label: 'Active', variant: 'default' as const, icon: Link2 };
  };

  return (
    <div className="space-y-6">
      {/* Create Invite */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Private Invite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Expires In</Label>
                <Select value={expiresDays} onValueChange={setExpiresDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Generate Invite Link
            </Button>
          </form>

          {lastCreatedUrl && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary shrink-0" />
              <code className="text-sm flex-1 truncate">{lastCreatedUrl}</code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Invite History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : invites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invites yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const status = getStatus(invite);
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(invite.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {!invite.is_used && !invite.is_revoked && new Date(invite.expires_at) > new Date() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRevoke(invite.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
