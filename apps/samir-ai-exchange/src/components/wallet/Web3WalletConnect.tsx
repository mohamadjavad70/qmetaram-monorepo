import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Web3Provider } from '@/providers/Web3Provider';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

function Web3WalletConnectInner() {
  const { user } = useAuthContext();
  const { address, isConnected, chain } = useAccount();
  const { data: bnbBalance } = useBalance({ address });

  // Save connected wallet to DB
  useEffect(() => {
    if (isConnected && address && user) {
      supabase
        .from('web3_wallets')
        .upsert(
          { user_id: user.id, wallet_address: address, chain_id: chain?.id || 56 },
          { onConflict: 'user_id,wallet_address' }
        )
        .then(() => {});
    }
  }, [isConnected, address, user, chain]);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Web3 Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectButton />

        {isConnected && address && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm text-muted-foreground">Network</span>
              <Badge variant="outline" className="gap-1">
                {chain?.name || 'BSC'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
            {bnbBalance && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-muted-foreground">BNB Balance</span>
                <span className="text-sm font-mono font-bold">
                  {(Number(bnbBalance.value) / 1e18).toFixed(4)} BNB
                </span>
              </div>
            )}
            <a
              href={`https://bscscan.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on BscScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Web3WalletConnect() {
  if (!projectId) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            Web3 Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Web3 wallet connection is not configured. Set VITE_WALLETCONNECT_PROJECT_ID to enable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Web3Provider>
      <Web3WalletConnectInner />
    </Web3Provider>
  );
}
