import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Browser } from '@capacitor/browser';

export interface FocusSession {
  id: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  completed: boolean;
  coinsEarned: number;
  type: 'quick' | 'deep' | 'power';
}

export interface FocusStats {
  dailyCoins: number;
  weeklyCoins: number;
  monthlyCoins: number;
  currentStreak: number;
  totalSessions: number;
  dailyScreenTimeSaved: number;
  todaySessions: number;
  lastActivityDate: string;
  breakGlassUsed: number; // Monthly counter
  breakGlassResetDate: string;
}

export interface WhitelistItem {
  type: 'url' | 'app';
  value: string;
  description: string;
  category: 'educational' | 'library' | 'emergency';
}

class FocusService {
  private activeFocusSession: FocusSession | null = null;
  private focusTimer: NodeJS.Timeout | null = null;
  private blockedApps: string[] = [
    'com.instagram.android',
    'com.twitter.android',
    'com.facebook.katana',
    'com.snapchat.android',
    'com.zhiliaoapp.musically', // TikTok
    'com.whatsapp',
    'com.discord',
    'com.reddit.frontpage',
    'com.netflix.mediaclient',
    'com.spotify.music',
    'com.google.android.youtube',
  ];
  
  private whitelist: WhitelistItem[] = [
    { type: 'url', value: 'education', description: 'Educational websites', category: 'educational' },
    { type: 'url', value: 'library', description: 'Digital libraries', category: 'library' },
    { type: 'url', value: 'pdf', description: 'PDF documents', category: 'library' },
    { type: 'url', value: 'edu', description: 'Educational domains', category: 'educational' },
    { type: 'url', value: 'coursera.org', description: 'Coursera', category: 'educational' },
    { type: 'url', value: 'edx.org', description: 'EdX', category: 'educational' },
    { type: 'url', value: 'khanacademy.org', description: 'Khan Academy', category: 'educational' },
    { type: 'url', value: 'scholar.google.com', description: 'Google Scholar', category: 'educational' },
    { type: 'url', value: 'wikipedia.org', description: 'Wikipedia', category: 'educational' },
  ];

  async startFocusSession(duration: number, type: 'quick' | 'deep' | 'power'): Promise<FocusSession> {
    if (this.activeFocusSession) {
      throw new Error('Focus session already active');
    }

    const session: FocusSession = {
      id: `session_${Date.now()}`,
      duration,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      completed: false,
      coinsEarned: this.calculateCoins(duration, type),
      type
    };

    this.activeFocusSession = session;
    await this.enableFocusMode();
    this.startFocusTimer(duration);
    
    // Save session to storage
    this.saveFocusSession(session);
    
    return session;
  }

  private calculateCoins(duration: number, type: string): number {
    const baseCoins = duration * 2; // 2 coins per minute
    const multiplier = type === 'power' ? 2 : type === 'deep' ? 1.5 : 1;
    return Math.floor(baseCoins * multiplier);
  }

  private startFocusTimer(duration: number): void {
    this.focusTimer = setTimeout(async () => {
      await this.completeFocusSession();
    }, duration * 60 * 1000);
  }

  async completeFocusSession(): Promise<void> {
    if (!this.activeFocusSession) return;

    this.activeFocusSession.completed = true;
    await this.disableFocusMode();
    
    // Award coins and update stats
    await this.awardCoins(this.activeFocusSession.coinsEarned);
    await this.updateStats();
    
    // Clear timer
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }

    // Notify completion
    this.notifySessionComplete(this.activeFocusSession);
    this.activeFocusSession = null;
  }

  async breakFocusSession(): Promise<boolean> {
    const stats = await this.getFocusStats();
    const currentMonth = new Date().getMonth();
    const resetMonth = stats.breakGlassResetDate ? new Date(stats.breakGlassResetDate).getMonth() : -1;
    
    // Reset counter if new month
    if (currentMonth !== resetMonth) {
      stats.breakGlassUsed = 0;
      stats.breakGlassResetDate = new Date().toISOString();
    }

    // Check if break attempts available
    if (stats.breakGlassUsed >= 2) {
      return false; // No more breaks available this month
    }

    // Use break attempt
    stats.breakGlassUsed++;
    await this.saveFocusStats(stats);
    
    // End session without completion
    await this.disableFocusMode();
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
    this.activeFocusSession = null;

    return true;
  }

  private async enableFocusMode(): Promise<void> {
    try {
      const device = await Device.getInfo();
      
      if (device.platform === 'android' || device.platform === 'ios') {
        // For mobile: Monitor app state changes
        App.addListener('appStateChange', this.handleAppStateChange.bind(this));
        
        // Start monitoring for blocked apps
        this.startAppMonitoring();
      }
    } catch (error) {
      console.warn('Could not enable native focus mode:', error);
    }
  }

  private async disableFocusMode(): Promise<void> {
    try {
      App.removeAllListeners();
    } catch (error) {
      console.warn('Could not disable focus mode:', error);
    }
  }

  private async handleAppStateChange(state: any): Promise<void> {
    if (!this.activeFocusSession) return;
    
    if (state.isActive === false) {
      // App went to background, check if user opened blocked app
      setTimeout(async () => {
        const device = await Device.getInfo();
        // In a real implementation, you'd check the foreground app
        // This is a simplified version
        console.log('Monitoring app switch during focus session');
      }, 1000);
    }
  }

  private startAppMonitoring(): void {
    // This would integrate with native plugins to actually monitor app usage
    console.log('Started app monitoring for focus session');
  }

  async openWhitelistedContent(url: string): Promise<void> {
    if (!this.isWhitelisted(url)) {
      throw new Error('Content not whitelisted for focus mode');
    }

    await Browser.open({
      url: url,
      presentationStyle: 'popover'
    });
  }

  private isWhitelisted(url: string): boolean {
    return this.whitelist.some(item => {
      if (item.type === 'url') {
        return url.toLowerCase().includes(item.value.toLowerCase());
      }
      return false;
    });
  }

  async addToWhitelist(item: WhitelistItem): Promise<void> {
    this.whitelist.push(item);
    localStorage.setItem('focus-whitelist', JSON.stringify(this.whitelist));
  }

  async removeFromWhitelist(value: string): Promise<void> {
    this.whitelist = this.whitelist.filter(item => item.value !== value);
    localStorage.setItem('focus-whitelist', JSON.stringify(this.whitelist));
  }

  getWhitelist(): WhitelistItem[] {
    return [...this.whitelist];
  }

  private async awardCoins(amount: number): Promise<void> {
    const stats = await this.getFocusStats();
    stats.dailyCoins += amount;
    stats.weeklyCoins += amount;
    stats.monthlyCoins += amount;
    await this.saveFocusStats(stats);
  }

  private async updateStats(): Promise<void> {
    const stats = await this.getFocusStats();
    const today = new Date().toDateString();
    
    if (stats.lastActivityDate === today) {
      stats.todaySessions++;
      stats.currentStreak = Math.max(stats.currentStreak, stats.todaySessions);
    } else {
      stats.todaySessions = 1;
      stats.currentStreak = 1;
      stats.dailyCoins = this.activeFocusSession?.coinsEarned || 0;
      stats.dailyScreenTimeSaved = this.activeFocusSession?.duration || 0;
    }
    
    stats.totalSessions++;
    stats.lastActivityDate = today;
    
    await this.saveFocusStats(stats);
  }

  async getFocusStats(): Promise<FocusStats> {
    const saved = localStorage.getItem('focus-stats');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      dailyCoins: 0,
      weeklyCoins: 0,
      monthlyCoins: 0,
      currentStreak: 0,
      totalSessions: 0,
      dailyScreenTimeSaved: 0,
      todaySessions: 0,
      lastActivityDate: '',
      breakGlassUsed: 0,
      breakGlassResetDate: new Date().toISOString()
    };
  }

  private async saveFocusStats(stats: FocusStats): Promise<void> {
    localStorage.setItem('focus-stats', JSON.stringify(stats));
  }

  private saveFocusSession(session: FocusSession): void {
    const sessions = this.getFocusSessions();
    sessions.push(session);
    localStorage.setItem('focus-sessions', JSON.stringify(sessions));
  }

  getFocusSessions(): FocusSession[] {
    const saved = localStorage.getItem('focus-sessions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }

  getCurrentSession(): FocusSession | null {
    return this.activeFocusSession;
  }

  getTimeRemaining(): number {
    if (!this.activeFocusSession) return 0;
    const now = new Date().getTime();
    const end = this.activeFocusSession.endTime.getTime();
    return Math.max(0, Math.floor((end - now) / 1000));
  }

  private notifySessionComplete(session: FocusSession): void {
    // This would trigger a notification
    console.log(`Focus session completed! Earned ${session.coinsEarned} coins! 🎉`);
    
    // Trigger custom event for UI updates
    window.dispatchEvent(new CustomEvent('focusSessionComplete', {
      detail: session
    }));
  }
}

export const focusService = new FocusService();