import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById } from "@/data/modules";
import { 
  ArrowLeft, Music, Play, Pause, Square, Volume2, 
  Plus, Trash2, Download, Wand2, Clock, 
  Sparkles, Loader2, Music2, Drum, Guitar, Piano, 
  Mic2, Waves, RefreshCw, Settings2, Headphones,
  FileAudio, List, Grid3X3, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Track {
  id: string;
  name: string;
  type: "drums" | "bass" | "synth" | "melody" | "vocal" | "fx" | "ai";
  color: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  clips: Clip[];
  audioUrl?: string;
}

interface Clip {
  id: string;
  start: number;
  duration: number;
  content: string;
  audioUrl?: string;
}

interface GeneratedTrack {
  id: string;
  name: string;
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
  audioUrl: string;
  createdAt: Date;
}

const TRACK_COLORS = {
  drums: "#ef4444",
  bass: "#f97316", 
  synth: "#8b5cf6",
  melody: "#06b6d4",
  vocal: "#ec4899",
  fx: "#22c55e",
  ai: "#9370db",
};

const GENRES = [
  "Electronic", "Hip-Hop", "Pop", "Rock", "Jazz", "Classical", 
  "Ambient", "Cinematic", "Lo-Fi", "House", "Techno", "R&B",
  "Folk", "Country", "Metal", "Reggae", "Funk", "Soul"
];

const MOODS = [
  "Energetic", "Calm", "Dark", "Uplifting", "Melancholic", 
  "Epic", "Playful", "Mysterious", "Romantic", "Aggressive",
  "Dreamy", "Nostalgic", "Triumphant", "Suspenseful"
];

const INSTRUMENTS = [
  "Piano", "Guitar", "Drums", "Bass", "Synth", "Strings", 
  "Brass", "Vocals", "Percussion", "Organ", "Violin", "Flute"
];

const BeethovenStudio = () => {
  const module = getModuleById("beethoven");
  const { toast } = useToast();
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(80);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"compose" | "daw" | "library">("compose");
  
  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState(30);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  
  // Library and tracks
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [tracks, setTracks] = useState<Track[]>([
    { id: "1", name: "Drums", type: "drums", color: TRACK_COLORS.drums, volume: 75, muted: false, solo: false, clips: [] },
    { id: "2", name: "Bass", type: "bass", color: TRACK_COLORS.bass, volume: 70, muted: false, solo: false, clips: [] },
    { id: "3", name: "Synth", type: "synth", color: TRACK_COLORS.synth, volume: 60, muted: false, solo: false, clips: [] },
    { id: "4", name: "Melody", type: "melody", color: TRACK_COLORS.melody, volume: 65, muted: false, solo: false, clips: [] },
  ]);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const totalBars = 16;
  const pixelsPerBar = 100;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalBars) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (bpm / 60 / 4);
        });
      }, 1000 / 4);
    }
    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  const buildMusicPrompt = useCallback(() => {
    const parts: string[] = [];
    
    if (prompt.trim()) {
      parts.push(prompt.trim());
    }
    
    if (genre) parts.push(`${genre} genre`);
    if (mood) parts.push(`${mood.toLowerCase()} mood`);
    if (selectedInstruments.length > 0) {
      parts.push(`featuring ${selectedInstruments.join(", ")}`);
    }
    parts.push(`${bpm} BPM`);
    
    return parts.join(", ") || "Create an original instrumental track";
  }, [prompt, genre, mood, selectedInstruments, bpm]);

  const generateMusic = async () => {
    const fullPrompt = buildMusicPrompt();
    
    if (!fullPrompt || fullPrompt === "Create an original instrumental track") {
      toast({
        title: "Prompt Required",
        description: "Please describe the music you want to create",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: fullPrompt,
            duration,
            mode: 'generate'
          }),
        }
      );
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate music');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setGenerationProgress(100);
      
      const newTrack: GeneratedTrack = {
        id: Date.now().toString(),
        name: `AI Track ${generatedTracks.length + 1}`,
        prompt: fullPrompt,
        genre: genre || "Mixed",
        mood: mood || "Neutral",
        duration,
        audioUrl,
        createdAt: new Date(),
      };
      
      setGeneratedTracks(prev => [newTrack, ...prev]);
      
      // Play the generated track
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = masterVolume / 100;
        audioRef.current.play();
      }
      
      toast({
        title: "Music Generated!",
        description: `Created "${newTrack.name}" - ${duration}s`,
      });
      
    } catch (error) {
      console.error('Music generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate music",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateSFX = async (sfxPrompt: string) => {
    if (!sfxPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: sfxPrompt,
            duration: 5,
            mode: 'sfx'
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate sound effect');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = masterVolume / 100;
        audioRef.current.play();
      }
      
      toast({ title: "Sound Effect Generated!" });
      
    } catch (error) {
      toast({
        title: "SFX Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate SFX",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addTrackFromLibrary = (generatedTrack: GeneratedTrack) => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: generatedTrack.name,
      type: "ai",
      color: TRACK_COLORS.ai,
      volume: 70,
      muted: false,
      solo: false,
      audioUrl: generatedTrack.audioUrl,
      clips: [{
        id: `clip-${Date.now()}`,
        start: 0,
        duration: Math.ceil(generatedTrack.duration / (60 / bpm) * 4),
        content: generatedTrack.name,
        audioUrl: generatedTrack.audioUrl
      }]
    };
    
    setTracks(prev => [...prev, newTrack]);
    setActiveTab("daw");
    toast({ title: "Track Added to DAW", description: `Added "${generatedTrack.name}" to arrangement` });
  };

  const exportTrack = async (track: GeneratedTrack) => {
    try {
      const response = await fetch(track.audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.name.replace(/\s+/g, '-')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Export Complete", description: `Downloaded ${track.name}.mp3` });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-xl">Module Not Found</h1>
      </div>
    );
  }

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleStop = () => { 
    setIsPlaying(false); 
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const addTrack = (type: Track["type"]) => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${tracks.filter(t => t.type === type).length + 1}`,
      type,
      color: TRACK_COLORS[type],
      volume: 70,
      muted: false,
      solo: false,
      clips: []
    };
    setTracks([...tracks, newTrack]);
  };

  const deleteTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const toggleMute = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const toggleSolo = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, solo: !t.solo } : t));
  };

  const setTrackVolume = (id: string, volume: number) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, volume } : t));
  };

  const formatTime = (bars: number) => {
    const mins = Math.floor(bars / (bpm / 60) / 4);
    const secs = Math.floor((bars / (bpm / 60) / 4 - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      <Navbar />
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex-1 flex flex-col pt-16">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#9370db]/30 bg-[#16162a] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/modules/beethoven" className="flex items-center gap-2 text-[#9370db] hover:text-[#b19cd9] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Exit</span>
            </Link>
            <div className="flex items-center gap-2">
              <img src={module.iconImage} alt="Beethoven" className="w-8 h-8" />
              <span className="font-orbitron font-bold text-[#9370db]">Beethoven AI</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg px-4 py-2 border border-[#9370db]/20">
            <Button size="sm" variant="ghost" onClick={handleStop} className="text-[#9370db] hover:bg-[#9370db]/20">
              <Square className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={isPlaying ? handlePause : handlePlay}
              className="text-[#9370db] hover:bg-[#9370db]/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2 ml-4 text-[#9370db]/60 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 ml-4 border-l border-[#9370db]/20 pl-4">
              <span className="text-xs text-[#9370db]/60">BPM</span>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Math.min(300, Math.max(40, parseInt(e.target.value) || 120)))}
                className="w-14 bg-[#0d0d1a] border border-[#9370db]/30 rounded px-2 py-1 text-sm text-[#9370db] text-center"
              />
            </div>
            <div className="flex items-center gap-2 ml-4 border-l border-[#9370db]/20 pl-4">
              <Volume2 className="w-4 h-4 text-[#9370db]/60" />
              <Slider
                value={[masterVolume]}
                max={100}
                step={1}
                className="w-20"
                onValueChange={([v]) => {
                  setMasterVolume(v);
                  if (audioRef.current) audioRef.current.volume = v / 100;
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="bg-[#0d0d1a] border border-[#9370db]/20">
                <TabsTrigger value="compose" className="data-[state=active]:bg-[#9370db] data-[state=active]:text-white">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Compose
                </TabsTrigger>
                <TabsTrigger value="daw" className="data-[state=active]:bg-[#9370db] data-[state=active]:text-white">
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  DAW
                </TabsTrigger>
                <TabsTrigger value="library" className="data-[state=active]:bg-[#9370db] data-[state=active]:text-white">
                  <List className="w-4 h-4 mr-1" />
                  Library
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "compose" && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full p-6 overflow-auto"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Main Prompt */}
                  <Card className="bg-[#16162a] border-[#9370db]/20">
                    <CardHeader>
                      <CardTitle className="text-[#9370db] flex items-center gap-2">
                        <Wand2 className="w-5 h-5" />
                        AI Music Composer
                      </CardTitle>
                      <CardDescription>
                        Describe your music and let Beethoven create it for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-[#9370db]/80">Describe your music</Label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="A dreamy lo-fi beat with soft piano melodies, vinyl crackle, and a relaxing vibe perfect for studying..."
                          className="mt-2 bg-[#0d0d1a] border-[#9370db]/30 text-white placeholder:text-[#9370db]/30 min-h-[100px]"
                          maxLength={400}
                        />
                        <p className="text-xs text-[#9370db]/40 mt-1">{prompt.length}/400 characters</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#9370db]/80">Genre</Label>
                          <Select value={genre} onValueChange={setGenre}>
                            <SelectTrigger className="mt-2 bg-[#0d0d1a] border-[#9370db]/30 text-white">
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16162a] border-[#9370db]/30">
                              {GENRES.map(g => (
                                <SelectItem key={g} value={g} className="text-white hover:bg-[#9370db]/20">
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[#9370db]/80">Mood</Label>
                          <Select value={mood} onValueChange={setMood}>
                            <SelectTrigger className="mt-2 bg-[#0d0d1a] border-[#9370db]/30 text-white">
                              <SelectValue placeholder="Select mood" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16162a] border-[#9370db]/30">
                              {MOODS.map(m => (
                                <SelectItem key={m} value={m} className="text-white hover:bg-[#9370db]/20">
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[#9370db]/80">Duration: {duration} seconds</Label>
                        <Slider
                          value={[duration]}
                          min={15}
                          max={120}
                          step={5}
                          className="mt-2"
                          onValueChange={([v]) => setDuration(v)}
                        />
                        <div className="flex justify-between text-xs text-[#9370db]/40 mt-1">
                          <span>15s</span>
                          <span>120s</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[#9370db]/80">Instruments (optional)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {INSTRUMENTS.map(instrument => (
                            <Badge
                              key={instrument}
                              variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                selectedInstruments.includes(instrument)
                                  ? "bg-[#9370db] text-white"
                                  : "border-[#9370db]/30 text-[#9370db]/60 hover:bg-[#9370db]/10"
                              }`}
                              onClick={() => toggleInstrument(instrument)}
                            >
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {isGenerating && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#9370db]">Generating music...</span>
                            <span className="text-[#9370db]/60">{Math.round(generationProgress)}%</span>
                          </div>
                          <Progress value={generationProgress} className="h-2" />
                        </div>
                      )}

                      <Button
                        onClick={generateMusic}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-[#9370db] to-[#b19cd9] hover:opacity-90 text-white h-12"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Composing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Generate Music
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick SFX */}
                  <Card className="bg-[#16162a] border-[#9370db]/20">
                    <CardHeader>
                      <CardTitle className="text-[#9370db] flex items-center gap-2">
                        <Waves className="w-5 h-5" />
                        Quick Sound Effects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {["Cinematic boom", "Whoosh transition", "Sci-fi laser", "Thunder rumble", "Magic sparkle", "Drum fill"].map(sfx => (
                          <Button
                            key={sfx}
                            variant="outline"
                            size="sm"
                            disabled={isGenerating}
                            onClick={() => generateSFX(sfx)}
                            className="border-[#9370db]/30 text-[#9370db] hover:bg-[#9370db]/20"
                          >
                            {sfx}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "daw" && (
              <motion.div
                key="daw"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex"
              >
                {/* Track List Sidebar */}
                <aside className="w-64 border-r border-[#9370db]/20 bg-[#16162a] flex flex-col">
                  <div className="p-3 border-b border-[#9370db]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#9370db]/60 uppercase font-semibold">Tracks</span>
                      <div className="flex gap-1">
                        {Object.entries(TRACK_COLORS).slice(0, -1).map(([type, color]) => (
                          <Button
                            key={type}
                            size="sm"
                            variant="ghost"
                            className="w-6 h-6 p-0"
                            style={{ color }}
                            onClick={() => addTrack(type as Track["type"])}
                            title={`Add ${type}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {tracks.map((track) => (
                        <div
                          key={track.id}
                          className="bg-[#0d0d1a] rounded-lg p-2 border border-[#9370db]/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: track.color }} />
                              <span className="text-sm text-white/90 truncate max-w-[120px]">{track.name}</span>
                              {track.type === 'ai' && <Sparkles className="w-3 h-3 text-[#9370db]" />}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-6 h-6 p-0 text-red-500/50 hover:text-red-500"
                              onClick={() => deleteTrack(track.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              size="sm"
                              variant={track.muted ? "secondary" : "ghost"}
                              className="h-6 px-2 text-xs"
                              onClick={() => toggleMute(track.id)}
                            >
                              M
                            </Button>
                            <Button
                              size="sm"
                              variant={track.solo ? "default" : "ghost"}
                              className="h-6 px-2 text-xs"
                              style={track.solo ? { backgroundColor: track.color } : {}}
                              onClick={() => toggleSolo(track.id)}
                            >
                              S
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3 h-3 text-[#9370db]/40" />
                            <Slider
                              value={[track.volume]}
                              max={100}
                              step={1}
                              className="flex-1"
                              onValueChange={([v]) => setTrackVolume(track.id, v)}
                            />
                            <span className="text-xs text-[#9370db]/40 w-8 text-right">{track.volume}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </aside>

                {/* Timeline */}
                <main className="flex-1 flex flex-col bg-[#0d0d1a] overflow-hidden">
                  <div className="h-8 border-b border-[#9370db]/20 flex">
                    <div className="flex-1 relative">
                      {Array.from({ length: totalBars }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-full flex items-center text-xs text-[#9370db]/40"
                          style={{ left: i * pixelsPerBar }}
                        >
                          <span className="px-1">{i + 1}</span>
                          <div className="h-full border-l border-[#9370db]/10" />
                        </div>
                      ))}
                      <motion.div
                        className="absolute top-0 h-full w-0.5 bg-white z-10"
                        style={{ left: currentTime * pixelsPerBar }}
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="min-w-max">
                      {tracks.map((track) => (
                        <div
                          key={track.id}
                          className="h-20 border-b border-[#9370db]/10 flex"
                          style={{ opacity: track.muted ? 0.4 : 1 }}
                        >
                          <div 
                            className="relative flex-1"
                            style={{ width: totalBars * pixelsPerBar }}
                          >
                            {Array.from({ length: totalBars }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute top-0 h-full border-l border-[#9370db]/5"
                                style={{ left: i * pixelsPerBar }}
                              />
                            ))}
                            
                            {track.clips.map((clip) => (
                              <motion.div
                                key={clip.id}
                                className="absolute top-2 bottom-2 rounded-lg cursor-pointer flex items-center px-2"
                                style={{
                                  left: clip.start * pixelsPerBar,
                                  width: Math.max(clip.duration * pixelsPerBar - 4, 50),
                                  backgroundColor: track.color,
                                  opacity: 0.8,
                                }}
                                whileHover={{ opacity: 1, scale: 1.02 }}
                              >
                                {track.type === 'ai' && <Music2 className="w-4 h-4 text-white/80 mr-1" />}
                                <span className="text-xs text-white font-medium truncate">{clip.content}</span>
                              </motion.div>
                            ))}
                            
                            <div
                              className="absolute top-0 h-full w-0.5 bg-white/30"
                              style={{ left: currentTime * pixelsPerBar }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="h-10 border-t border-[#9370db]/20 flex items-center justify-between px-4 text-xs text-[#9370db]/60">
                    <span>{tracks.length} tracks • {bpm} BPM</span>
                    <span>Beethoven AI Music Studio</span>
                  </div>
                </main>
              </motion.div>
            )}

            {activeTab === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full p-6 overflow-auto"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#9370db]">Generated Tracks</h2>
                    <Badge variant="outline" className="border-[#9370db]/30 text-[#9370db]">
                      {generatedTracks.length} tracks
                    </Badge>
                  </div>

                  {generatedTracks.length === 0 ? (
                    <Card className="bg-[#16162a] border-[#9370db]/20">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Music className="w-12 h-12 text-[#9370db]/30 mb-4" />
                        <p className="text-[#9370db]/60">No tracks generated yet</p>
                        <Button
                          variant="outline"
                          className="mt-4 border-[#9370db]/30 text-[#9370db]"
                          onClick={() => setActiveTab("compose")}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Composing
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {generatedTracks.map(track => (
                        <Card key={track.id} className="bg-[#16162a] border-[#9370db]/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9370db] to-[#b19cd9] flex items-center justify-center">
                                  <Music2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-white">{track.name}</h3>
                                  <p className="text-sm text-[#9370db]/60 line-clamp-1">{track.prompt}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs border-[#9370db]/30 text-[#9370db]/80">
                                      {track.genre}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-[#9370db]/30 text-[#9370db]/80">
                                      {track.mood}
                                    </Badge>
                                    <span className="text-xs text-[#9370db]/40">{track.duration}s</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (audioRef.current) {
                                      audioRef.current.src = track.audioUrl;
                                      audioRef.current.play();
                                    }
                                  }}
                                  className="text-[#9370db] hover:bg-[#9370db]/20"
                                >
                                  <Headphones className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => addTrackFromLibrary(track)}
                                  className="text-[#9370db] hover:bg-[#9370db]/20"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => exportTrack(track)}
                                  className="text-[#9370db] hover:bg-[#9370db]/20"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BeethovenStudio;
