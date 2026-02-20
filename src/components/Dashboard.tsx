import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import mathBearImage from '@/assets/math-bear.png';
import cozyBearImage from '@/assets/cozy-bear.png';
import studyBearImage from '@/assets/study-bear.png';
import { useFocusData } from '@/hooks/useFocusData';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  theme: string;
  darkMode: boolean;
  setCurrentPage: (page: string) => void;
}

export function Dashboard({ theme, darkMode, setCurrentPage }: DashboardProps) {
  const { stats } = useFocusData();
  const { signOut } = useAuth();
  
  const focusStats = {
    dailyCoins: stats.daily_coins,
    dailyScreenTimeSaved: stats.daily_screen_time_saved,
    currentStreak: stats.current_streak,
    todaySessions: stats.today_sessions,
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions for theme-based styling
  const isBearTheme = () => ['ice-bear', 'grizzly', 'panda'].includes(theme);

  const getBearThemeColors = () => {
    switch (theme) {
      case 'ice-bear':
        return {
          primary: 'hsl(200 85% 65%)',
          background: 'hsl(0 0% 98%)',
          cream: 'hsl(210 20% 95%)',
          warm: 'hsl(205 30% 92%)',
          sage: 'hsl(195 25% 88%)',
          peach: 'hsl(30 15% 90%)',
          blue: 'hsl(200 85% 65%)',
          lavender: 'hsl(210 10% 75%)',
          text: 'hsl(210 25% 25%)',
          textLight: 'hsl(210 15% 45%)',
          brown: 'hsl(200 85% 65%)',
          grey: 'hsl(210 20% 35%)',
          emoji: '🐻‍❄️',
          gradient: 'ice-gradient'
        };
      case 'grizzly':
        return {
          primary: 'hsl(25 40% 35%)',
          background: 'hsl(40 30% 95%)',
          cream: 'hsl(40 30% 95%)',
          warm: 'hsl(35 45% 85%)',
          sage: 'hsl(25 60% 80%)',
          peach: 'hsl(20 75% 70%)',
          blue: 'hsl(45 85% 65%)',
          lavender: 'hsl(50 70% 75%)',
          text: 'hsl(25 35% 25%)',
          textLight: 'hsl(25 25% 45%)',
          brown: 'hsl(25 40% 35%)',
          grey: 'hsl(30 35% 40%)',
          emoji: '🐻',
          gradient: 'grizzly-gradient'
        };
      case 'panda':
        return {
          primary: 'hsl(280 60% 70%)',
          background: 'hsl(0 0% 98%)',
          cream: 'hsl(50 25% 95%)',
          warm: 'hsl(330 50% 88%)',
          sage: 'hsl(160 35% 85%)',
          peach: 'hsl(270 40% 88%)',
          blue: 'hsl(210 50% 85%)',
          lavender: 'hsl(270 40% 88%)',
          text: 'hsl(280 30% 25%)',
          textLight: 'hsl(280 20% 45%)',
          brown: 'hsl(280 60% 70%)',
          grey: 'hsl(280 15% 40%)',
          emoji: '🐼',
          gradient: 'panda-gradient'
        };
      default:
        return null;
    }
  };

  const quickStats = [
    { 
      title: 'Study Sessions', 
      value: focusStats.todaySessions.toString(), 
      emoji: '📚', 
      trend: '+' + focusStats.todaySessions,
      color: isBearTheme() ? 'bg-[var(--ice-mist)]' : 'bg-green-50',
      textColor: isBearTheme() ? 'text-[var(--ice-text)]' : 'text-green-700'
    },
    { 
      title: 'Bear Coins', 
      value: Math.floor(focusStats.dailyCoins).toString(), 
      emoji: '🪙', 
      trend: '+' + Math.floor(focusStats.dailyCoins),
      color: isBearTheme() ? 'bg-[var(--grizzly-peach)]' : 'bg-yellow-50',
      textColor: isBearTheme() ? 'text-[var(--grizzly-text)]' : 'text-yellow-700'
    },
    { 
      title: 'Time Saved', 
      value: focusStats.dailyScreenTimeSaved + 'm', 
      emoji: '⏰', 
      trend: '+' + focusStats.dailyScreenTimeSaved + 'm',
      color: isBearTheme() ? 'bg-[var(--panda-sky)]' : 'bg-blue-50',
      textColor: isBearTheme() ? 'text-[var(--panda-text)]' : 'text-blue-700'
    },
    { 
      title: 'Bear Streak', 
      value: focusStats.currentStreak.toString(), 
      emoji: isBearTheme() ? getBearThemeColors()?.emoji || '🔥' : '🔥', 
      trend: focusStats.currentStreak > 0 ? 'Active!' : 'Start today',
      color: isBearTheme() ? 'bg-[var(--panda-lavender)]' : 'bg-orange-50',
      textColor: isBearTheme() ? 'text-[var(--panda-text)]' : 'text-orange-700'
    },
  ];

  const tools = [
    { 
      name: 'Focus Timer', 
      emoji: isBearTheme() ? getBearThemeColors()?.emoji || '⏱️' : '⏱️', 
      desc: 'Cozy study sessions', 
      id: 'clock', 
      highlight: true,
      color: 'bg-primary/5'
    },
    { 
      name: 'Tasks', 
      emoji: '✅', 
      desc: 'Daily to-dos', 
      id: 'todo',
      color: 'bg-green-50'
    },
    { 
      name: 'Ideas', 
      emoji: '💡', 
      desc: 'Creative thoughts', 
      id: 'brain-dump',
      color: 'bg-yellow-50'
    },
    { 
      name: 'Habits', 
      emoji: '📅', 
      desc: 'Daily routines', 
      id: 'habit-tracker',
      color: 'bg-blue-50'
    },
    { 
      name: 'Assignments', 
      emoji: '📝', 
      desc: 'School work', 
      id: 'assignments',
      color: 'bg-purple-50'
    },
    { 
      name: 'Courses', 
      emoji: '📕', 
      desc: 'Class management', 
      id: 'courses',
      color: 'bg-indigo-50'
    },
    { 
      name: 'Library', 
      emoji: '📚', 
      desc: 'Resource hub', 
      id: 'library',
      color: 'bg-teal-50'
    },
    { 
      name: 'Schedule', 
      emoji: '🗓️', 
      desc: 'Time planning', 
      id: 'schedule',
      color: 'bg-red-50'
    },
    { 
      name: 'Reading', 
      emoji: '📖', 
      desc: 'Book progress', 
      id: 'book-tracker',
      color: 'bg-orange-50'
    },
    { 
      name: 'Focus Mode', 
      emoji: '🎯', 
      desc: 'Block distractions', 
      id: 'focus-mode',
      color: 'bg-rose-50'
    },
  ];

  const handleToolClick = (toolId: string) => {
    if (setCurrentPage) {
      setCurrentPage(toolId);
    }
  };

  const startQuickFocusSession = (minutes: number) => {
    setCurrentPage('clock');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('quickFocusStart', {
        detail: { minutes }
      }));
    }, 100);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    let name = 'Scholar';
    
    if (theme === 'ice-bear') name = 'cool friend';
    else if (theme === 'grizzly') name = 'energetic scholar';
    else if (theme === 'panda') name = 'sweet friend';
    
    if (hour < 12) return `Good morning, ${name} 🌅`;
    if (hour < 17) return `Good afternoon, ${name} ☀️`;
    return `Good evening, ${name} 🌙`;
  };

  const getMotivationalMessage = () => {
    if (theme === 'ice-bear') {
      return "Your calm polar bear companion is here to help you focus with peaceful, minimal study sessions! ❄️✨";
    } else if (theme === 'grizzly') {
      return "Your energetic grizzly friend is ready to power through productive autumn study sessions! 🍂✨";
    } else if (theme === 'panda') {
      return "Your adorable panda buddy brings cute, cozy vibes to make studying feel like a dreamy aesthetic experience! 🌸✨";
    }
    return "Ready to make today productive and amazing?";
  };

  const getThemeName = () => {
    if (theme === 'ice-bear') return 'Ice Bear';
    if (theme === 'grizzly') return 'Grizzly';
    if (theme === 'panda') return 'Panda';
    return 'Study';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const colors = getBearThemeColors();

  return (
    <div className="min-h-screen bg-background">
      {/* Theme-specific background pattern */}
      {isBearTheme() && (
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <div className={`absolute inset-0 ${colors?.gradient || ''}`}></div>
          <div className="absolute inset-0" style={{
            backgroundImage: theme === 'ice-bear' 
              ? `radial-gradient(circle at 20% 80%, hsl(200 85% 65%) 1px, transparent 1px),
                 radial-gradient(circle at 80% 20%, hsl(195 25% 88%) 1px, transparent 1px)`
              : theme === 'grizzly'
              ? `radial-gradient(circle at 20% 80%, hsl(25 60% 80%) 1px, transparent 1px),
                 radial-gradient(circle at 80% 20%, hsl(45 85% 65%) 1px, transparent 1px)`
              : `radial-gradient(circle at 20% 80%, hsl(330 50% 88%) 1px, transparent 1px),
                 radial-gradient(circle at 80% 20%, hsl(270 40% 88%) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 150px 150px'
          }}></div>
        </div>
      )}
      
      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-3 tracking-tight">
                  {getGreeting()}
                </h1>
                <p className="text-lg text-muted-foreground mb-4 max-w-xl leading-relaxed">
                  {getMotivationalMessage()}
                </p>
                
                {/* Date and Time Card */}
                <Card className="inline-flex items-center gap-4 px-4 py-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">Today</div>
                    <div className="text-lg font-medium text-card-foreground">{formatDate(currentTime)}</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">Time</div>
                    <div className="text-lg font-medium text-card-foreground font-mono">{formatTime(currentTime)}</div>
                  </div>
                </Card>
              </div>
              
              {/* Bear Mascot */}
              {isBearTheme() && (
                <div className="hidden lg:block">
                  <Card className="p-4">
                    <img 
                      src={cozyBearImage} 
                      alt={`${getThemeName()} Study Bear`} 
                      className="w-24 h-24 object-contain opacity-90"
                    />
                  </Card>
                </div>
              )}
            </div>
            
            {/* Quick Focus Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => startQuickFocusSession(25)}
                variant="outline"
                className="focus-transition hover:scale-105"
              >
                {isBearTheme() ? `${colors?.emoji} Cozy 25min` : '⚡ Quick 25min'}
              </Button>
              <Button
                onClick={() => startQuickFocusSession(45)}
                className="focus-transition hover:scale-105"
              >
                {isBearTheme() ? `${colors?.emoji} Deep 45min` : '🎯 Deep Work 45min'}
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {quickStats.map((stat, index) => (
            <Card 
              key={index} 
              className={`p-6 focus-transition hover:scale-105 ${isBearTheme() ? 'pinterest-card' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.emoji}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  stat.trend.startsWith('+') && stat.trend !== '+0' 
                    ? 'bg-green-100 text-green-700'
                    : stat.trend === 'Active!' 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-semibold mb-2 text-card-foreground">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Quick Focus Section */}
          <div className="xl:col-span-1">
            <Card className={`p-6 ${isBearTheme() ? 'pinterest-card' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {isBearTheme() ? `${getThemeName()} Focus` : 'Quick Focus'}
                </h3>
                {isBearTheme() && <span className="text-2xl">{colors?.emoji}</span>}
              </div>
              
              {/* Bear Image for Focus Section */}
              {isBearTheme() && (
                <div className="text-center mb-6">
                  <Card className="p-4 inline-block">
                    <img 
                      src={studyBearImage} 
                      alt={`${getThemeName()} Bear Taking Notes`} 
                      className="w-20 h-20 object-contain mx-auto opacity-90"
                    />
                  </Card>
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  onClick={() => startQuickFocusSession(25)}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 focus-transition hover:scale-105"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">{isBearTheme() ? colors?.emoji : '⚡'}</span>
                    <div>
                      <p className="font-semibold">
                        {isBearTheme() ? 'Cozy Session' : 'Quick Session'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        25 minutes • 50 coins
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => startQuickFocusSession(45)}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 focus-transition hover:scale-105"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">{isBearTheme() ? colors?.emoji : '🧠'}</span>
                    <div>
                      <p className="font-semibold">
                        {isBearTheme() ? 'Deep Focus' : 'Deep Work'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        45 minutes • 90 coins
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => startQuickFocusSession(90)}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 focus-transition hover:scale-105"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">{isBearTheme() ? colors?.emoji : '🚀'}</span>
                    <div>
                      <p className="font-semibold">
                        {isBearTheme() ? 'Power Study' : 'Power Session'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        90 minutes • 180 coins
                      </p>
                    </div>
                  </div>
                </Button>

                <Card className="p-4 mt-6">
                  <p className="text-xs text-center text-muted-foreground">
                    {isBearTheme() 
                      ? `${colors?.emoji} Your ${getThemeName().toLowerCase()} bear believes longer sessions build stronger habits!` 
                      : '💡 Longer sessions earn more coins and build stronger focus habits!'
                    }
                  </p>
                </Card>
              </div>
            </Card>
          </div>

          {/* Study Tools Grid */}
          <div className="xl:col-span-3">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {isBearTheme() ? `${getThemeName()}'s Study Toolkit ${colors?.emoji}` : 'Study Tools'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map((tool, index) => (
                <Button
                  key={index}
                  onClick={() => handleToolClick(tool.id)}
                  variant="outline"
                  className={`h-auto p-6 focus-transition hover:scale-105 ${
                    isBearTheme() ? 'pinterest-card' : ''
                  } ${tool.highlight ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <div className="text-center space-y-4">
                    <div className={`text-3xl group-hover:scale-110 transition-transform duration-200 ${
                      tool.highlight && !isBearTheme() ? 'animate-pulse' : ''
                    }`}>
                      {tool.emoji}
                    </div>
                    <div>
                      <div className={`font-semibold mb-1 ${
                        tool.highlight ? 'text-primary' : 'text-card-foreground'
                      }`}>
                        {tool.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tool.desc}
                      </div>
                      {tool.highlight && (
                        <div className="text-xs font-semibold mt-2 text-primary">
                          {isBearTheme() ? `${getThemeName()} Approved!` : 'Recommended!'}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Challenge Card */}
        <Card className={`p-8 ${isBearTheme() ? 'pinterest-card' : ''} bg-gradient-to-r from-primary/5 to-primary/10`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              {isBearTheme() && (
                <Card className="p-4">
                  <img 
                    src={mathBearImage} 
                    alt={`${getThemeName()} Bear Challenge`} 
                    className="w-16 h-16 object-contain opacity-90"
                  />
                </Card>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {isBearTheme() ? `${getThemeName()}'s Daily Challenge ${colors?.emoji}` : 'Today\'s Focus Challenge 🎯'}
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                  {isBearTheme() 
                    ? `Help your study ${getThemeName().toLowerCase()} by completing 3 focus sessions to earn a 100 coin bonus and make your bear proud!`
                    : 'Complete 3 focus sessions to earn a 100 coin bonus and extend your streak!'
                  }
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      focusStats.todaySessions >= 1 ? 'bg-primary' : 'bg-muted'
                    }`}></div>
                    <div className={`w-4 h-4 rounded-full ${
                      focusStats.todaySessions >= 2 ? 'bg-primary' : 'bg-muted'
                    }`}></div>
                    <div className={`w-4 h-4 rounded-full ${
                      focusStats.todaySessions >= 3 ? 'bg-primary' : 'bg-muted'
                    }`}></div>
                    <span className="text-lg font-medium text-muted-foreground ml-3">
                      {focusStats.todaySessions}/3 sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCurrentPage('clock')}
              size="lg"
              className="focus-transition hover:scale-105 whitespace-nowrap"
            >
              {isBearTheme() ? `Study with ${getThemeName()} ${colors?.emoji}` : 'Start Session'}
            </Button>
          </div>
        </Card>

        {/* Bear Theme Inspirational Footer */}
        {isBearTheme() && (
          <div className="mt-12 text-center">
            <Card className={`p-8 pinterest-card bg-gradient-to-br from-muted/50 to-background`}>
              <div className="text-6xl mb-4">{colors?.emoji}</div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Your Study {getThemeName()} Believes in You!
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {theme === 'ice-bear' && "Just like this polar bear working calmly through problems, you have the focus and determination to succeed. Every peaceful study session builds stronger habits. Stay cool and focused! ❄️"}
                {theme === 'grizzly' && "Just like this energetic grizzly tackling challenges, you have the power and motivation to achieve your goals. Every productive session brings you closer to success. Keep that energy flowing! 🍂"}
                {theme === 'panda' && "Just like this adorable panda creating beautiful work, you have everything it takes to make your studies amazing. Every cute study session is a step toward your dreams. Stay dreamy and creative! 🌸"}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}