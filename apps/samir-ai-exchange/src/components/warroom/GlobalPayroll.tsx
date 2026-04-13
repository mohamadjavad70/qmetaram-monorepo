import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, Plus, Loader2, CheckCircle, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function GlobalPayroll() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  // Credit daily wages to all employees
  const creditWages = useMutation({
    mutationFn: async () => {
      if (!employees?.length) throw new Error('No employees');
      
      for (const emp of employees) {
        const { error } = await supabase
          .from('employees')
          .update({
            virtual_balance: Number(emp.virtual_balance) + Number(emp.daily_rate),
            total_earned: Number(emp.total_earned) + Number(emp.daily_rate),
            last_credit_at: new Date().toISOString(),
          })
          .eq('id', emp.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`Daily wages credited to ${employees?.length} employees`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Add employee
  const addEmployee = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error('Name required');
      const { error } = await supabase.from('employees').insert({
        full_name: newName.trim(),
        role_title: newRole.trim() || 'Team Member',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setNewName('');
      setNewRole('');
      toast.success('Employee added');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const totalBalance = employees?.reduce((s, e) => s + Number(e.virtual_balance), 0) || 0;
  const totalEarned = employees?.reduce((s, e) => s + Number(e.total_earned), 0) || 0;
  const totalWithdrawn = employees?.reduce((s, e) => s + Number(e.total_withdrawn), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Employees</p>
            <p className="text-2xl font-bold mt-1">{employees?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-green-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Earned</p>
            <p className="text-2xl font-bold mono-text text-green-400 mt-1">${totalEarned.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Balance</p>
            <p className="text-2xl font-bold mono-text text-amber-400 mt-1">${totalBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              Human Impact Leaderboard
            </CardTitle>
            <Button
              onClick={() => creditWages.mutate()}
              disabled={creditWages.isPending || !employees?.length}
              size="sm"
              className="gap-2"
            >
              {creditWages.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Credit Daily Wages ($200)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Daily Rate</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead className="text-right">Withdrawn</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Last Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{emp.role_title}</Badge></TableCell>
                    <TableCell className="text-right mono-text">${Number(emp.daily_rate).toFixed(0)}</TableCell>
                    <TableCell className="text-right mono-text text-green-400">${Number(emp.total_earned).toLocaleString()}</TableCell>
                    <TableCell className="text-right mono-text">${Number(emp.total_withdrawn).toLocaleString()}</TableCell>
                    <TableCell className="text-right mono-text font-bold text-amber-400">${Number(emp.virtual_balance).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {emp.last_credit_at ? new Date(emp.last_credit_at).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add employee */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="flex-1"
            />
            <Input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role (optional)"
              className="w-40"
            />
            <Button onClick={() => addEmployee.mutate()} disabled={addEmployee.isPending || !newName.trim()} size="icon">
              {addEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
