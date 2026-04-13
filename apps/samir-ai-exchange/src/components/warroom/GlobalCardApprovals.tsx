import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Check, X, Loader2 } from 'lucide-react';

export const GlobalCardApprovals = () => {
  const queryClient = useQueryClient();

  const { data: cards, isLoading } = useQuery({
    queryKey: ['international-cards-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('international_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { error } = await supabase
        .from('international_cards')
        .update({
          status,
          admin_note: note || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['international-cards-pending'] });
      toast.success('Card status updated');
    },
  });

  const pendingCards = cards?.filter(c => c.status === 'pending_verification') || [];
  const processedCards = cards?.filter(c => c.status !== 'pending_verification') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Pending Card Verifications ({pendingCards.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCards.length > 0 ? (
            <div className="space-y-3">
              {pendingCards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{card.cardholder_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {card.card_brand.toUpperCase()} •••• {card.card_last_four}
                        {card.expiry_masked && ` | Exp: ${card.expiry_masked}`}
                      </p>
                      <p className="text-xs text-muted-foreground mono-text">
                        User: {card.user_id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateCard.mutate({ id: card.id, status: 'verified', note: 'Admin verified' })}
                      disabled={updateCard.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateCard.mutate({ id: card.id, status: 'rejected', note: 'Admin rejected' })}
                      disabled={updateCard.isPending}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">No pending card verifications.</p>
          )}
        </CardContent>
      </Card>

      {processedCards.length > 0 && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Recently Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedCards.slice(0, 10).map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{card.cardholder_name}</span>
                    <span className="text-xs text-muted-foreground">•••• {card.card_last_four}</span>
                  </div>
                  <Badge variant={card.status === 'verified' ? 'default' : card.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {card.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
