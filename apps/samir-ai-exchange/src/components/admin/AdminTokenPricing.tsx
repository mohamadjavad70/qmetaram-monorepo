import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Coins, Save, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface PlatformAsset {
  id: string;
  name: string;
  symbol: string;
  icon_emoji: string | null;
  asset_type: string;
  current_price_usd: number;
  base_price_usd: number;
  price_change_24h: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  total_supply: number | null;
  circulating_supply: number | null;
  is_platform_token: boolean | null;
  fee_discount_percent: number | null;
  is_active: boolean | null;
}

export const AdminTokenPricing = () => {
  const [assets, setAssets] = useState<PlatformAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [editingDiscounts, setEditingDiscounts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_assets')
        .select('*')
        .order('is_platform_token', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setAssets(data || []);
      
      // Initialize editing state
      const prices: Record<string, string> = {};
      const discounts: Record<string, string> = {};
      data?.forEach(asset => {
        prices[asset.id] = asset.current_price_usd.toString();
        discounts[asset.id] = (asset.fee_discount_percent || 0).toString();
      });
      setEditingPrices(prices);
      setEditingDiscounts(discounts);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssetPrice = async (assetId: string) => {
    const newPrice = parseFloat(editingPrices[assetId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Invalid price');
      return;
    }

    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;

      const priceChange = ((newPrice - asset.base_price_usd) / asset.base_price_usd) * 100;

      const { error } = await supabase
        .from('platform_assets')
        .update({ 
          current_price_usd: newPrice,
          price_change_24h: priceChange,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

      if (error) throw error;

      // Add to price history
      await supabase.from('price_history').insert({
        asset_id: assetId,
        price_usd: newPrice,
        open_price: asset.current_price_usd,
        close_price: newPrice,
        high: Math.max(asset.current_price_usd, newPrice),
        low: Math.min(asset.current_price_usd, newPrice),
      });

      setAssets(prev => prev.map(a => 
        a.id === assetId ? { ...a, current_price_usd: newPrice, price_change_24h: priceChange } : a
      ));
      
      toast.success('Price updated');
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  const updateFeeDiscount = async (assetId: string) => {
    const newDiscount = parseFloat(editingDiscounts[assetId]);
    if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }

    try {
      const { error } = await supabase
        .from('platform_assets')
        .update({ 
          fee_discount_percent: newDiscount,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

      if (error) throw error;

      setAssets(prev => prev.map(a => 
        a.id === assetId ? { ...a, fee_discount_percent: newDiscount } : a
      ));
      
      toast.success('Fee discount updated');
    } catch (error) {
      console.error('Error updating fee discount:', error);
      toast.error('Failed to update fee discount');
    }
  };

  const toggleAssetActive = async (assetId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('platform_assets')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

      if (error) throw error;

      setAssets(prev => prev.map(a => 
        a.id === assetId ? { ...a, is_active: !currentStatus } : a
      ));
      
      toast.success(`Asset ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling asset:', error);
      toast.error('Failed to toggle asset');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Token & Asset Pricing
          </span>
          <Button onClick={fetchAssets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Asset</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead>New Price</TableHead>
                <TableHead>Fee Discount</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading assets...
                  </TableCell>
                </TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id} className={asset.is_platform_token ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{asset.icon_emoji}</span>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {asset.name}
                            {asset.is_platform_token && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                Platform Token
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPrice(asset.current_price_usd)}
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${
                        (asset.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(asset.price_change_24h || 0) >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {(asset.price_change_24h || 0).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        value={editingPrices[asset.id] || ''}
                        onChange={(e) => setEditingPrices(prev => ({ ...prev, [asset.id]: e.target.value }))}
                        className="w-32 h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={editingDiscounts[asset.id] || ''}
                          onChange={(e) => setEditingDiscounts(prev => ({ ...prev, [asset.id]: e.target.value }))}
                          className="w-20 h-8"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={asset.is_active ?? true}
                        onCheckedChange={() => toggleAssetActive(asset.id, asset.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAssetPrice(asset.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFeeDiscount(asset.id)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Platform Token Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {assets.filter(a => a.is_platform_token).map(token => (
            <Card key={token.id} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{token.icon_emoji}</span>
                    <div>
                      <h3 className="font-bold">{token.name}</h3>
                      <p className="text-sm text-muted-foreground">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatPrice(token.current_price_usd)}</p>
                    <p className="text-sm text-muted-foreground">
                      Volume: {formatNumber(token.volume_24h)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Market Cap</p>
                    <p className="font-medium">{formatNumber(token.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Supply</p>
                    <p className="font-medium">{formatNumber(token.total_supply)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee Discount</p>
                    <p className="font-medium text-primary">{token.fee_discount_percent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
