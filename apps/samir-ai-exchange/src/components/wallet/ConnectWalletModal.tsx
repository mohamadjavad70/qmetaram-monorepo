import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Building2 } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectWalletModal({ open, onOpenChange }: ConnectWalletModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">
            {t('connectYourWallet')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Web3 wallet or payment method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* RainbowKit Connect (MetaMask, WalletConnect, etc.) */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              🔗 Crypto Wallets
            </h3>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>

          {/* Bank Transfer Info */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">{t('bankTransfer')}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Transfer directly to our bank accounts in Germany (EUR), Turkey (TRY), or Iran (IRR)
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
