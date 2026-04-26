import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { 
  Map as MapIcon, 
  Filter, 
  Database,
  Search,
  ChevronRight,
  Info,
  Shield,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { SiRadar } from 'react-icons/si';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

import { rpcCall } from './api';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Input } from './components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { ScrollArea } from './components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table';

import { SightingsMap, Sighting } from './features/SightingsMap';
import { UfoShip } from './features/UfoShip';

function App() {
  const [activeView, setActiveView] = useState('map');
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    year: '',
    shape: '',
    country: '',
    search: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sightingsData, statsData, optionsData] = await Promise.all([
        rpcCall({ func: 'get_sightings', args: { filters: {
          year: filters.year ? parseInt(filters.year) : undefined,
          shape: filters.shape || undefined,
          country: filters.country || undefined
        }, limit: 1000 } }),
        rpcCall({ func: 'get_stats' }),
        rpcCall({ func: 'get_filter_options' })
      ]);
      
      setSightings(sightingsData);
      setStats(statsData);
      setFilterOptions(optionsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.year, filters.shape, filters.country]);

  useEffect(() => {
    fetchData();
    console.log("RENDER_SUCCESS");
  }, [fetchData]);

  const filteredSightings = useMemo(() => {
    if (!filters.search) return sightings;
    const s = filters.search.toLowerCase();
    return sightings.filter(item => 
      item.city?.toLowerCase().includes(s) || 
      item.comments?.toLowerCase().includes(s) ||
      item.shape?.toLowerCase().includes(s)
    );
  }, [sightings, filters.search]);

  const navItems = [
    { id: 'map', label: 'Tactical Map', icon: MapIcon },
    { id: 'database', label: 'Sightings Database', icon: Database },
  ];

  return (
    <div className="flex h-screen flex-col md:flex-row bg-[#020617] text-foreground overflow-hidden font-sans">
      
      {/* Cinematic 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Suspense fallback={null}>
            <group position={[4, 2, -5]}>
               <UfoShip />
            </group>
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Decorative Grid Overlays */}
      <div className="fixed inset-0 pointer-events-none bg-dot-grid opacity-10 z-[1]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05)_0%,transparent_100%)] z-[1]" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex-col gap-6 z-20 relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-2"
        >
          <div className="rounded-xl bg-primary/10 p-2.5 border border-primary/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <SiRadar className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
              UFO Tracker
            </h1>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em] leading-none">Intelligence Hub</p>
          </div>
        </motion.div>

        <nav className="space-y-1">
          {navItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 border",
                activeView === item.id
                  ? "bg-primary/20 text-primary shadow-[inset_0_0_12px_rgba(34,211,238,0.1)] border-primary/30"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              )}
            >
              <item.icon className={cn("h-4 w-4", activeView === item.id && "animate-pulse")} />
              <span className="font-bold tracking-widest uppercase text-[11px]">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <Separator className="bg-white/5" />

        <div className="space-y-5">
          <div className="flex items-center gap-2 px-2">
            <Filter className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tactical Filters</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-primary/60 tracking-wider ml-1">Timeframe</label>
              <Select value={filters.year || "all"} onValueChange={(v) => setFilters(f => ({...f, year: v === "all" ? "" : v}))}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:border-primary/50 transition-colors rounded-xl text-xs">
                  <SelectValue placeholder="All Eras" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10">
                  <SelectItem value="all">Global Archive</SelectItem>
                  {filterOptions?.years?.map((y: number) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-primary/60 tracking-wider ml-1">Craft Signature</label>
              <Select value={filters.shape || "all"} onValueChange={(v) => setFilters(f => ({...f, shape: v === "all" ? "" : v}))}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:border-primary/50 transition-colors rounded-xl text-xs capitalize">
                  <SelectValue placeholder="All Signatures" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10">
                  <SelectItem value="all">Universal Forms</SelectItem>
                  {filterOptions?.shapes?.map((s: string) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-primary/60 tracking-wider ml-1">Geospatial Sector</label>
              <Select value={filters.country || "all"} onValueChange={(v) => setFilters(f => ({...f, country: v === "all" ? "" : v}))}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:border-primary/50 transition-colors rounded-xl text-xs uppercase">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10">
                  <SelectItem value="all">Earth Orbit</SelectItem>
                  {filterOptions?.countries?.map((c: string) => (
                    <SelectItem key={c} value={c} className="uppercase">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <p className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Developer Credits</p>
            <h4 className="text-sm font-bold text-white tracking-tight">Ruby Poddar</h4>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">Lead Systems Architect</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative overflow-hidden">
        {/* Header Stats */}
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sighted</span>
              <span className="text-xl font-bold tracking-tighter text-primary">{stats?.total_sightings?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Signature</span>
              <span className="text-xl font-bold tracking-tighter text-white capitalize">{stats?.top_shape || '---'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hot Sector</span>
              <span className="text-xl font-bold tracking-tighter text-white uppercase">{stats?.top_country || '---'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search intercepts..." 
                className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-xs focus:ring-primary/20"
                value={filters.search}
                onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
              />
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">
          {activeView === 'map' ? (
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-20 -z-10" />
                <SightingsMap sightings={sightings} selectedSightingId={selectedId} />
              </div>
              
              <div className="h-64 flex gap-6 min-h-0">
                 <Card className="flex-1 bg-black/40 backdrop-blur-md border-white/5 rounded-3xl overflow-hidden flex flex-col">
                   <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-2">
                       <Radio className="h-3 w-3 text-primary animate-pulse" />
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Recent Signal Intercepts</h3>
                     </div>
                     <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary">LIVE FEED</Badge>
                   </div>
                   <ScrollArea className="flex-1">
                     <div className="divide-y divide-white/5">
                       {filteredSightings.slice(0, 50).map(sighting => (
                         <motion.div 
                          key={sighting.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "p-4 hover:bg-primary/5 cursor-pointer transition-all duration-300 group relative flex items-center justify-between",
                            selectedId === sighting.id && "bg-primary/10"
                          )}
                          onClick={() => setSelectedId(sighting.id)}
                         >
                           <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-mono text-primary/60">{sighting.datetime.split(' ')[0]}</span>
                               <span className="text-xs font-bold tracking-tight capitalize">{sighting.city}</span>
                             </div>
                             <p className="text-[10px] text-muted-foreground truncate max-w-[400px] italic">"{sighting.comments}"</p>
                           </div>
                           <div className="flex items-center gap-4 text-right">
                             <div className="flex flex-col items-end">
                               <Badge variant="outline" className="text-[9px] uppercase border-white/10 group-hover:border-primary/50 transition-colors">{sighting.shape}</Badge>
                               <span className="text-[9px] text-muted-foreground font-mono mt-1">{sighting.duration_hours_min}</span>
                             </div>
                             <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                           </div>
                         </motion.div>
                       ))}
                     </div>
                   </ScrollArea>
                 </Card>
                 
                 <Card className="w-80 bg-black/40 backdrop-blur-md border-white/5 rounded-3xl overflow-hidden flex flex-col p-6 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Status</p>
                          <p className="text-sm font-bold">OPERATIONAL</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">DATA INTEGRITY</span>
                          <span className="text-primary">99.9%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '99.9%' }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/5" />
                    
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Intelligence Brief</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Monitoring terrestrial airspace for non-kinetic atmospheric anomalies. High frequency of <span className="text-primary font-bold">"{stats?.top_shape}"</span> type signatures detected in sector <span className="text-primary font-bold">{stats?.top_country?.toUpperCase()}</span>.
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Button className="w-full bg-primary text-black hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        Initialize Warp Drive
                      </Button>
                    </div>
                 </Card>
              </div>
            </div>
          ) : (
            <Card className="flex-1 bg-black/40 backdrop-blur-md border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <CardHeader className="px-8 py-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight uppercase">Intercept Archive</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Deep exploration of verified atmospheric signatures.</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10 hover:border-primary/50 text-xs gap-2">
                    <Database className="h-3 w-3" />
                    Export Telemetry
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="bg-white/5 sticky top-0 z-20 backdrop-blur-md">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest px-8">Intercept Time</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Geospatial Sector</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Signature</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Duration</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest px-8">Briefing Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSightings.map(sighting => (
                        <TableRow 
                          key={sighting.id} 
                          className="border-white/5 hover:bg-primary/5 transition-colors cursor-pointer group"
                          onClick={() => { setSelectedId(sighting.id); setActiveView('map'); }}
                        >
                          <TableCell className="px-8 text-[11px] font-mono text-primary/60">{sighting.datetime}</TableCell>
                          <TableCell className="text-[11px] font-bold">
                            <span className="text-white group-hover:text-primary transition-colors">{sighting.city}, {sighting.state}</span> 
                            <Badge variant="outline" className="ml-2 text-[8px] h-3.5 px-1.5 border-white/10 uppercase font-mono">{sighting.country}</Badge>
                          </TableCell>
                          <TableCell className="text-[11px] capitalize">
                            <Badge className="bg-white/5 hover:bg-white/10 text-white border-white/5 text-[9px] uppercase tracking-wider">{sighting.shape}</Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground font-mono">{sighting.duration_hours_min || '-'}</TableCell>
                          <TableCell className="px-8 text-[11px] text-muted-foreground italic leading-relaxed min-w-[300px] py-4">
                            {sighting.comments}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Mobile Footer Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 bg-black/60 backdrop-blur-xl flex justify-around py-3 z-30">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-1 transition-all duration-300",
              activeView === item.id ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeView === item.id && "animate-pulse")} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em]">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
