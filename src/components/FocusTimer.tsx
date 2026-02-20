import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFocusData, FocusSession } from '@/hooks/useFocusData';
import { useToast } from '@/hooks/use-toast';

interface FocusTimerProps {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ theme, setCurrentPage }) => {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [whitelistUrl, setWhitelistUrl] = useState('');
  const [whitelistDescription, setWhitelistDescription] = useState('');
  const { toast } = useToast();

  const {
    stats,
    whitelist,
    startSession,
    completeSession,
    breakSession,
    addWhitelistItem,
    removeWhitelistItem,
  } = useFocusData();

  useEffect(() => {
    const handleQuickFocus = (event: any) => {
      handleStartSession(event.detail.minutes);
    };
    window.addEventListener('quickFocusStart', handleQuickFocus);
    return () => window.removeEventListener('quickFocusStart', handleQuickFocus);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeSession, timeRemaining]);

  const handleStartSession = async (duration: number) => {
    try {
      const type = duration <= 25 ? 'quick' : duration <= 45 ? 'deep' : 'power';
      const session = await startSession(duration, type);
      if (session) {
        setActiveSession(session);
        setTimeRemaining(duration * 60);
        toast({
          title: 'Focus session started! 🎯',
          description: `${duration} minutes. Earn ${session.coins_earned} coins!`,
        });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not start session.', variant: 'destructive' });
    }
  };

  const handleSessionComplete = async () => {
    if (!activeSession) return;
    await completeSession(activeSession.id, activeSession.coins_earned, activeSession.duration);
    setActiveSession(null);
    setTimeRemaining(0);
    toast({ title: 'Session complete! 🎉', description: `Earned ${activeSession.coins_earned} coins!` });
  };

  const handleBreakFocus = async () => {
    const canBreak = await breakSession();
    if (canBreak) {
      setActiveSession(null);
      setTimeRemaining(0);
      setShowBreakDialog(false);
      toast({ title: 'Focus session ended', description: 'Break glass used.', variant: 'destructive' });
    } else {
      toast({ title: 'No breaks remaining', description: 'Stay focused! No more breaks this month.', variant: 'destructive' });
    }
  };

  const handleAddWhitelist = async () => {
    if (!whitelistUrl.trim()) return;
    await addWhitelistItem(whitelistUrl, whitelistDescription || whitelistUrl);
    setWhitelistUrl('');
    setWhitelistDescription('');
    toast({ title: 'Added to whitelist', description: 'Accessible during focus sessions.' });
  };

  const openWhitelistedContent = (url: string) => {
    const isAllowed = whitelist.some(item => url.toLowerCase().includes(item.value.toLowerCase()));
    if (isAllowed || !activeSession) {
      window.open(url, '_blank');
    } else {
      toast({ title: 'Access denied', description: 'Not whitelisted.', variant: 'destructive' });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!activeSession) return 0;
    const total = activeSession.duration * 60;
    return ((total - timeRemaining) / total) * 100;
  };

  const getBearEmoji = () => {
    if (theme === 'ice-bear') return '🐻‍❄️';
    if (theme === 'grizzly') return '🐻';
    if (theme === 'panda') return '🐼';
    return '🎯';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
          ← Back to Dashboard
        </Button>

        {activeSession ? (
          <Card className="p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{getBearEmoji()} Focus Mode Active</h1>
            <div className="text-6xl font-mono mb-4">{formatTime(timeRemaining)}</div>
            <Progress value={getProgress()} className="w-full max-w-md mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-6">
              Earn {activeSession.coins_earned} coins when you complete this session!
            </p>

            <AlertDialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  🚨 Emergency Break ({2 - (stats.break_glass_used || 0)}/2 remaining)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Break Focus Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You can only use 2 emergency breaks per month. No coins will be awarded.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay Focused</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBreakFocus} className="bg-destructive text-destructive-foreground">
                    Break Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">📚 Study Resources</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {whitelist.slice(0, 6).map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => openWhitelistedContent(`https://${item.value}`)}
                    className="text-xs"
                  >
                    📖 {item.description || item.value}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="p-8 text-center">
              <h1 className="text-4xl font-bold mb-6">{getBearEmoji()} Focus Timer</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Start a focus session to block distractions and earn coins!
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { duration: 25, type: 'Cozy Session', coins: 50, emoji: '⚡' },
                    { duration: 45, type: 'Deep Focus', coins: 135, emoji: '🧠' },
                    { duration: 90, type: 'Power Study', coins: 360, emoji: '🚀' },
                  ].map((opt) => (
                    <Button
                      key={opt.duration}
                      variant={selectedDuration === opt.duration ? 'default' : 'outline'}
                      onClick={() => setSelectedDuration(opt.duration)}
                      className="p-6 h-auto flex-col"
                    >
                      <div className="text-2xl mb-2">{opt.emoji}</div>
                      <div className="font-semibold">{opt.type}</div>
                      <div className="text-sm text-muted-foreground">{opt.duration} min</div>
                      <div className="text-sm font-semibold">{opt.coins} coins</div>
                    </Button>
                  ))}
                </div>
                <Button onClick={() => handleStartSession(selectedDuration)} size="lg" className="text-lg px-8 py-4">
                  Start {selectedDuration} Minute Session
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🪙</div>
                <div className="text-2xl font-bold">{stats.daily_coins}</div>
                <div className="text-sm text-muted-foreground">Daily Coins</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-2xl font-bold">{stats.current_streak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-2xl font-bold">{stats.today_sessions}</div>
                <div className="text-sm text-muted-foreground">Today's Sessions</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🚨</div>
                <div className="text-2xl font-bold">{2 - (stats.break_glass_used || 0)}</div>
                <div className="text-sm text-muted-foreground">Breaks Left</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">📖 Study Resources Whitelist</h3>
              <p className="text-muted-foreground mb-6">
                Add educational websites accessible during focus sessions.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="url">URL or Keywords</Label>
                    <Input id="url" value={whitelistUrl} onChange={(e) => setWhitelistUrl(e.target.value)} placeholder="e.g., coursera.org" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="desc">Description</Label>
                    <Input id="desc" value={whitelistDescription} onChange={(e) => setWhitelistDescription(e.target.value)} placeholder="e.g., Math tutorials" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddWhitelist}>Add</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {whitelist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">{item.value}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.category === 'educational' ? 'default' : 'secondary'}>{item.category}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeWhitelistItem(item.id)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
