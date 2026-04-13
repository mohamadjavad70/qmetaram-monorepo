import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Eye, 
  EyeOff,
  QrCode,
  History,
  CreditCard,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConnectWalletModal } from '@/components/wallet/ConnectWalletModal';
import { IranianCardLinking } from '@/components/wallet/IranianCardLinking';
import { TomanDeposit } from '@/components/wallet/TomanDeposit';
import { TomanWithdraw } from '@/components/wallet/TomanWithdraw';
import { GlobalWithdraw } from '@/components/wallet/GlobalWithdraw';
import { Web3WalletConnect } from '@/components/wallet/Web3WalletConnect';
import { InternationalCardLinking } from '@/components/wallet/InternationalCardLinking';
import { useWalletBalances, useTotalBalanceUSD } from '@/hooks/useWalletBalances';
import { toast } from 'sonner';

const EMOJI_MAP: Record<string, string> = {
  EUR: '🇪🇺', USD: '🇺🇸', IRT: '🇮🇷', BTC: '🪙', ETH: '💎',
  TRY: '🇹🇷', USDT: '💵', BNB: '🔶', NOOR: '✦',
};

const SYMBOL_MAP: Record<string, string> = {
  EUR: '€', USD: '$', IRT: '﷼', BTC: '₿', ETH: 'Ξ',
  TRY: '₺', USDT: '$', BNB: 'B', NOOR: '✦',
};

export default function Wallet() {
  const { t } = useLanguage();
  const [hideBalances, setHideBalances] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tomanTab, setTomanTab] = useState('deposit');
  const [showGlobalWithdraw, setShowGlobalWithdraw] = useState(false);

  const { data: wallets, isLoading, error } = useWalletBalances();
  const totalBalanceUSD = useTotalBalanceUSD();

  const selectedWallet = wallets?.[selectedIndex];

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t('wallet')}</h1>
            <p className="text-muted-foreground mt-1">Manage your wallets and transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setHideBalances(!hideBalances)}>
              {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setWalletModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('connectWallet')}
            </Button>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="glass-panel bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">{t('totalBalance')}</p>
                <h2 className="text-4xl font-bold mt-2">
                  {isLoading ? (
                    <Skeleton className="h-10 w-48" />
                  ) : hideBalances ? '••••••' : `$${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </h2>
                {!isLoading && wallets?.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No wallet balances found. Deposit to get started.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="gap-2">
                  <ArrowDownLeft className="h-5 w-5" />
                  {t('deposit')}
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => setShowGlobalWithdraw(!showGlobalWithdraw)}>
                  <ArrowUpRight className="h-5 w-5" />
                  {t('withdraw')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Withdraw Panel */}
        {showGlobalWithdraw && <GlobalWithdraw />}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Wallets List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">{t('myWallets')}</h2>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="glass-panel">
                    <CardContent className="p-4">
                      <Skeleton className="h-14 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="glass-panel border-destructive/30">
                <CardContent className="p-4 text-center text-destructive">
                  Failed to load wallets. Please try again.
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {wallets?.map((wallet, idx) => {
                  const sym = wallet.symbol ?? '???';
                  const flag = wallet.icon_emoji || EMOJI_MAP[sym] || '💰';
                  const currSymbol = SYMBOL_MAP[sym] || '';
                  return (
                    <Card
                      key={wallet.id}
                      className={`glass-panel cursor-pointer transition-all hover:border-primary/50 ${
                        selectedIndex === idx ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{flag}</span>
                            <div>
                              <p className="font-medium">{wallet.name ?? sym}</p>
                              <p className="text-sm text-muted-foreground">{sym}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {hideBalances ? '••••' : `${currSymbol}${wallet.balance.toLocaleString()}`}
                            </p>
                            {wallet.current_price_usd && !hideBalances && (
                              <p className="text-xs text-muted-foreground">
                                ≈ ${(wallet.balance * wallet.current_price_usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Wallet Details */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {selectedWallet ? (selectedWallet.icon_emoji || EMOJI_MAP[selectedWallet.symbol ?? ''] || '💰') : '💰'}
                </span>
                {selectedWallet?.name ?? 'Select a wallet'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedWallet ? (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Balance</p>
                    <p className="text-2xl font-bold font-mono">
                      {hideBalances ? '••••' : selectedWallet.balance.toLocaleString()}
                      <span className="text-sm text-muted-foreground ml-1">{selectedWallet.symbol}</span>
                    </p>
                    {selectedWallet.locked_balance > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        🔒 Locked: {selectedWallet.locked_balance.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="gap-2">
                      <ArrowDownLeft className="h-4 w-4" />
                      {t('deposit')}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      {t('withdraw')}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {isLoading ? 'Loading...' : 'No wallet selected'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Web3 Wallet */}
          <Web3WalletConnect />
        </div>

        {/* Iranian Toman Section */}
        <Card className="glass-panel border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🇮🇷</span>
              تومان ایران - Iranian Toman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tomanTab} onValueChange={setTomanTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="deposit" className="gap-2">
                  <Banknote className="h-4 w-4" />
                  واریز
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  برداشت
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  کارت‌ها
                </TabsTrigger>
              </TabsList>
              <TabsContent value="deposit"><TomanDeposit /></TabsContent>
              <TabsContent value="withdraw"><TomanWithdraw /></TabsContent>
              <TabsContent value="cards"><IranianCardLinking /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* International Card Linking */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Global Card (Visa / Mastercard)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InternationalCardLinking />
          </CardContent>
        </Card>
      </div>

      <ConnectWalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </MainLayout>
  );
}
