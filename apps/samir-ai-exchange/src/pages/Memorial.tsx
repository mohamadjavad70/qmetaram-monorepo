import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TreePine, MapPin, Heart, Leaf, Search, Loader2, Sprout } from 'lucide-react';

interface MemorialTree {
  id: string;
  victim_name: string;
  victim_city: string | null;
  sapling_type: string;
  location_description: string | null;
  status: string;
  memorial_hash: string;
  created_at: string;
}

function getSaplingRecommendation(lat: number): string {
  if (lat > 36) return 'مرکبات / فندق / گردو (اقلیم معتدل)';
  if (lat > 33) return 'سیب / گیلاس / بادام (اقلیم سردسیر)';
  return 'انار / پسته / عناب (اقلیم خشک)';
}

function generateMemorialHash(name: string, city: string, year: string): string {
  const str = `${name}-${city}-${year}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export default function Memorial() {
  const { user } = useAuthContext();
  const [trees, setTrees] = useState<MemorialTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [totalTrees, setTotalTrees] = useState(0);

  // Form state
  const [victimName, setVictimName] = useState('');
  const [victimCity, setVictimCity] = useState('');
  const [victimYear, setVictimYear] = useState('');
  const [locationDesc, setLocationDesc] = useState('');

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    const { data, count } = await supabase
      .from('memorial_trees')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setTrees(data as MemorialTree[]);
    if (count !== null) setTotalTrees(count);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('لطفاً ابتدا وارد حساب خود شوید');
      return;
    }
    if (!victimName.trim()) {
      toast.error('نام عزیز از دست رفته الزامی است');
      return;
    }

    setSubmitting(true);

    // Estimate latitude from city name (simplified)
    const lat = victimCity.includes('تهران') ? 35.7 
      : victimCity.includes('اصفهان') ? 32.6 
      : victimCity.includes('شیراز') ? 29.6 
      : victimCity.includes('تبریز') ? 38.0 
      : victimCity.includes('مشهد') ? 36.3
      : victimCity.includes('رشت') ? 37.3
      : victimCity.includes('کرمان') ? 30.3
      : 34.0;

    const saplingType = getSaplingRecommendation(lat);
    const memorialHash = generateMemorialHash(victimName, victimCity, victimYear);

    const { error } = await supabase.from('memorial_trees').insert({
      user_id: user.id,
      victim_name: victimName.trim(),
      victim_city: victimCity.trim() || null,
      victim_year: victimYear.trim() || null,
      sapling_type: saplingType,
      latitude: lat,
      longitude: 51.4, // Default Tehran
      location_description: locationDesc.trim() || null,
      memorial_hash: memorialHash,
      status: 'pending',
    });

    if (error) {
      toast.error('خطا در ثبت درخواست');
      console.error(error);
    } else {
      toast.success(`نهال ${saplingType} به یاد «${victimName}» ثبت شد 🌳`);
      setVictimName('');
      setVictimCity('');
      setVictimYear('');
      setLocationDesc('');
      fetchTrees();
    }
    setSubmitting(false);
  };

  const filteredTrees = search
    ? trees.filter(t => t.victim_name.includes(search) || t.victim_city?.includes(search))
    : trees;

  const totalAreaM2 = totalTrees * 10;
  const totalAreaHa = (totalAreaM2 / 10000).toFixed(1);
  const co2Offset = (totalTrees * 22).toLocaleString();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-green-700/20 border border-green-500/20 p-8">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <TreePine key={i} className="absolute text-green-400" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${12 + Math.random() * 20}px`,
                opacity: 0.3 + Math.random() * 0.5,
              }} />
            ))}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <TreePine className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl font-bold text-green-100">جنگل ابدی یادبود</h1>
            </div>
            <p className="text-green-200/80 text-lg max-w-2xl leading-relaxed">
              قدرت در دست کد است، نه در دست آدم‌ها. برای هر عزیز از دست رفته، ۱۰ متر مربع از کره زمین را سبز می‌کنیم.
              نهال میوه‌دار، متناسب با اقلیم منطقه شما.
            </p>
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{totalTrees.toLocaleString()}</p>
                <p className="text-xs text-green-400/70">نهال ثبت شده</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{totalAreaHa}</p>
                <p className="text-xs text-green-400/70">هکتار پوشش</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{co2Offset}</p>
                <p className="text-xs text-green-400/70">کیلوگرم CO₂ جذب سالانه</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <Card className="lg:col-span-1 bg-card/50 backdrop-blur border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sprout className="h-5 w-5 text-green-400" />
                دریافت نهال یادبود
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="victimName">نام عزیز از دست رفته *</Label>
                  <Input
                    id="victimName"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className="mt-1"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="victimCity">شهر</Label>
                  <Input
                    id="victimCity"
                    value={victimCity}
                    onChange={(e) => setVictimCity(e.target.value)}
                    placeholder="مثلاً: تهران، اصفهان، شیراز"
                    className="mt-1"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="victimYear">سال</Label>
                  <Input
                    id="victimYear"
                    value={victimYear}
                    onChange={(e) => setVictimYear(e.target.value)}
                    placeholder="مثلاً: ۱۴۰۱"
                    className="mt-1"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="locationDesc">محل کاشت (اختیاری)</Label>
                  <Input
                    id="locationDesc"
                    value={locationDesc}
                    onChange={(e) => setLocationDesc(e.target.value)}
                    placeholder="آدرس یا منطقه‌ای که نهال کاشته می‌شود"
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                {victimCity && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      نهال پیشنهادی بر اساس اقلیم:
                    </p>
                    <p className="text-sm font-medium text-green-300 mt-1">
                      {getSaplingRecommendation(
                        victimCity.includes('تهران') ? 35.7
                          : victimCity.includes('تبریز') ? 38
                          : victimCity.includes('شیراز') ? 29.6
                          : 34
                      )}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={submitting || !victimName.trim()}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TreePine className="h-4 w-4 mr-2" />
                  )}
                  ثبت نهال یادبود
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Memorial Wall */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-400" />
                  دیوار یادبود
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجوی نام..."
                    className="pl-9 w-48"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                </div>
              ) : filteredTrees.length === 0 ? (
                <div className="text-center py-12">
                  <TreePine className="h-12 w-12 text-green-400/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {search ? 'نتیجه‌ای یافت نشد' : 'اولین نهال یادبود را ثبت کنید'}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredTrees.map((tree) => (
                    <div
                      key={tree.id}
                      className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10 hover:border-green-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{tree.victim_name}</p>
                          {tree.victim_city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {tree.victim_city}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            tree.status === 'planted'
                              ? 'text-green-400 border-green-400/30'
                              : tree.status === 'shipping'
                              ? 'text-amber-400 border-amber-400/30'
                              : 'text-muted-foreground border-border'
                          }
                        >
                          {tree.status === 'planted' ? '🌳 کاشته شده' : tree.status === 'shipping' ? '📦 در حال ارسال' : '⏳ در انتظار'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Leaf className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400/80">{tree.sapling_type}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
                        #{tree.memorial_hash}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
