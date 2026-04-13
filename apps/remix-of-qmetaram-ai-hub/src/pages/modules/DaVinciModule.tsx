import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { checkModuleAccess } from "@/lib/checkAccess";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ImageIcon, Trash2 } from "lucide-react";

export default function DaVinciModule() {
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkModuleAccess().then((ok) => {
      if (!ok) navigate("/pricing?upgrade=true", { replace: true });
      else setAccessChecked(true);
    });
  }, [navigate]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (!accessChecked) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-orbitron text-lg font-bold text-da-vinci mb-6">🎨 دا وینچی — استودیو تصویر</h2>

          {/* Upload */}
          <div className="flex gap-3 mb-6">
            <input type="file" ref={fileRef} accept="image/*" onChange={handleFile} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="border-da-vinci/30">
              <Upload className="w-4 h-4 mr-2" />آپلود تصویر
            </Button>
            {image && <Button variant="ghost" onClick={() => setImage(null)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />حذف</Button>}
          </div>

          {/* Canvas */}
          <Card className="glass-strong overflow-hidden">
            <div className="aspect-video flex items-center justify-center bg-muted/20 relative min-h-[300px]">
              {image ? (
                <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={image} alt="uploaded"
                  className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>تصویر خود را آپلود کنید</p>
                  <p className="text-xs mt-1">PNG, JPG, WebP</p>
                </div>
              )}
            </div>
          </Card>

          <p className="text-center text-muted-foreground text-sm mt-8">
            در نسخه‌های بعدی قابلیت ویرایش و تولید تصویر با AI اضافه خواهد شد.
          </p>
        </div>
      </main>
    </div>
  );
}
