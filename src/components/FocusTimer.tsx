import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { focusService, FocusSession, WhitelistItem } from '@/services/FocusService';
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
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [focusStats, setFocusStats] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Listen for quick focus start events
    const handleQuickFocus = (event: any) => {
      startFocusSession(event.detail.minutes);
    };
    
    window.addEventListener('quickFocusStart', handleQuickFocus);
    
    return () => {
      window.removeEventListener('quickFocusStart', handleQuickFocus);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession) {
      interval = setInterval(() => {
        const remaining = focusService.getTimeRemaining();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleSessionComplete();
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const loadData = async () => {
    const currentSession = focusService.getCurrentSession();
    const stats = await focusService.getFocusStats();
    const currentWhitelist = focusService.getWhitelist();
    
    setActiveSession(currentSession);
    setFocusStats(stats);
    setWhitelist(currentWhitelist);
    
    if (currentSession) {
      setTimeRemaining(focusService.getTimeRemaining());
    }
  };

  const startFocusSession = async (duration: number) => {
    try {
      const sessionType = duration <= 25 ? 'quick' : duration <= 45 ? 'deep' : 'power';
      const session = await focusService.startFocusSession(duration, sessionType);
      setActiveSession(session);
      setTimeRemaining(duration * 60);
      
      toast({
        title: "Focus session started! 🎯",
        description: `${duration} minutes of focused work. You'll earn ${session.coinsEarned} coins!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start focus session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSessionComplete = async () => {
    await focusService.completeFocusSession();
    setActiveSession(null);
    setTimeRemaining(0);
    await loadData();
    
    toast({
      title: "Session complete! 🎉",
      description: `Great work! You've earned your coins and extended your streak!`,
    });
  };

  const handleBreakFocus = async () => {
    const canBreak = await focusService.breakFocusSession();
    
    if (canBreak) {
      setActiveSession(null);
      setTimeRemaining(0);
      setShowBreakDialog(false);
      await loadData();
      
      toast({
        title: "Focus session ended",
        description: `Break glass used. You have ${2 - focusStats.breakGlassUsed} breaks remaining this month.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "No breaks remaining",
        description: "You've used all your break attempts this month. Stay focused!",
        variant: "destructive"
      });
    }
  };

  const addToWhitelist = async () => {
    if (!whitelistUrl.trim()) return;
    
    const item: WhitelistItem = {
      type: 'url',
      value: whitelistUrl,
      description: whitelistDescription || whitelistUrl,
      category: 'educational'
    };
    
    await focusService.addToWhitelist(item);
    setWhitelist(focusService.getWhitelist());
    setWhitelistUrl('');
    setWhitelistDescription('');
    
    toast({
      title: "Added to whitelist",
      description: "This content will be accessible during focus sessions.",
    });
  };

  const removeFromWhitelist = async (value: string) => {
    await focusService.removeFromWhitelist(value);
    setWhitelist(focusService.getWhitelist());
    
    toast({
      title: "Removed from whitelist",
      description: "This content will now be blocked during focus sessions.",
    });
  };

  const openWhitelistedContent = async (url: string) => {
    try {
      await focusService.openWhitelistedContent(url);
    } catch (error) {
      toast({
        title: "Access denied",
        description: "This content is not whitelisted for focus mode.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!activeSession) return 0;
    const totalTime = activeSession.duration * 60;
    const elapsed = totalTime - timeRemaining;
    return (elapsed / totalTime) * 100;
  };

  const getBearThemeColors = () => {
    switch (theme) {
      case 'ice-bear':
        return {
          primary: 'var(--ice-blue)',
          background: 'var(--ice-white)',
          cream: 'var(--ice-snow)',
          text: 'var(--ice-text)',
          emoji: '🐻‍❄️'
        };
      case 'grizzly':
        return {
          primary: 'var(--grizzly-deep)',
          background: 'var(--grizzly-cream)',
          cream: 'var(--grizzly-cream)',
          text: 'var(--grizzly-text)',
          emoji: '🐻'
        };
      case 'panda':
        return {
          primary: 'var(--panda-purple)',
          background: 'var(--panda-white)',
          cream: 'var(--panda-cream)',
          text: 'var(--panda-text)',
          emoji: '🐼'
        };
      default:
        return null;
    }
  };

  const colors = getBearThemeColors();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
          ← Back to Dashboard
        </Button>

        {/* Active Session */}
        {activeSession ? (
          <Card className="p-8 mb-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">
                {colors ? `${colors.emoji} Focus Mode Active` : '🎯 Focus Mode Active'}
              </h1>
              <div className="text-6xl font-mono mb-4">
                {formatTime(timeRemaining)}
              </div>
              <Progress value={getProgressPercentage()} className="w-full max-w-md mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Earn {activeSession.coinsEarned} coins when you complete this session!
              </p>
            </div>

            {/* Emergency Break */}
            <div className="space-y-4">
              <AlertDialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    🚨 Emergency Break ({2 - focusStats.breakGlassUsed}/2 remaining this month)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Break Focus Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You can only use 2 emergency breaks per month. After that, you'll need to complete your sessions. 
                      This will not award any coins and will reset your progress.
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
            </div>

            {/* Whitelisted Quick Access */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">📚 Study Resources (Available during focus)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'Khan Academy', url: 'https://khanacademy.org' },
                  { name: 'Coursera', url: 'https://coursera.org' },
                  { name: 'Wikipedia', url: 'https://wikipedia.org' },
                  { name: 'Google Scholar', url: 'https://scholar.google.com' },
                ].map((resource, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => openWhitelistedContent(resource.url)}
                    className="text-xs"
                  >
                    📖 {resource.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          /* Session Setup */
          <div className="space-y-8">
            <Card className="p-8 text-center">
              <h1 className="text-4xl font-bold mb-6">
                {colors ? `${colors.emoji} Focus Timer` : '🎯 Focus Timer'}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Start a focus session to block distracting apps and earn coins!
              </p>

              {/* Duration Selection */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="duration" className="text-lg font-semibold">Select Duration</Label>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {[
                      { duration: 25, type: 'Cozy Session', coins: 50, emoji: '⚡' },
                      { duration: 45, type: 'Deep Focus', coins: 90, emoji: '🧠' },
                      { duration: 90, type: 'Power Study', coins: 180, emoji: '🚀' },
                    ].map((option) => (
                      <Button
                        key={option.duration}
                        variant={selectedDuration === option.duration ? 'default' : 'outline'}
                        onClick={() => setSelectedDuration(option.duration)}
                        className="p-6 h-auto flex-col"
                      >
                        <div className="text-2xl mb-2">{option.emoji}</div>
                        <div className="font-semibold">{option.type}</div>
                        <div className="text-sm text-muted-foreground">{option.duration} min</div>
                        <div className="text-sm font-semibold text-primary">{option.coins} coins</div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => startFocusSession(selectedDuration)}
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Start {selectedDuration} Minute Session
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🪙</div>
                <div className="text-2xl font-bold">{focusStats.dailyCoins || 0}</div>
                <div className="text-sm text-muted-foreground">Daily Coins</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-2xl font-bold">{focusStats.currentStreak || 0}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-2xl font-bold">{focusStats.todaySessions || 0}</div>
                <div className="text-sm text-muted-foreground">Today's Sessions</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl mb-2">🚨</div>
                <div className="text-2xl font-bold">{2 - (focusStats.breakGlassUsed || 0)}</div>
                <div className="text-sm text-muted-foreground">Breaks Left</div>
              </Card>
            </div>

            {/* Whitelist Management */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">📖 Study Resources Whitelist</h3>
              <p className="text-muted-foreground mb-6">
                Add educational websites and resources that you want to access during focus sessions.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="url">URL or Keywords</Label>
                    <Input
                      id="url"
                      value={whitelistUrl}
                      onChange={(e) => setWhitelistUrl(e.target.value)}
                      placeholder="e.g., khan, coursera.org, library"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={whitelistDescription}
                      onChange={(e) => setWhitelistDescription(e.target.value)}
                      placeholder="e.g., Math tutorials"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addToWhitelist}>Add</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {whitelist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">{item.value}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.category === 'educational' ? 'default' : 'secondary'}>
                          {item.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWhitelist(item.value)}
                        >
                          Remove
                        </Button>
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