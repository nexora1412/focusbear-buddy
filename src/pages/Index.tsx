import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FocusTimer } from '@/components/FocusTimer';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('panda'); // Default to panda theme
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('focusbear-theme');
    const savedDarkMode = localStorage.getItem('focusbear-darkmode');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('focusbear-theme', theme);
    localStorage.setItem('focusbear-darkmode', JSON.stringify(darkMode));
  }, [theme, darkMode]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard theme={theme} darkMode={darkMode} setCurrentPage={setCurrentPage} />;
      case 'clock':
        return <FocusTimer theme={theme} setCurrentPage={setCurrentPage} />;
      case 'courses':
        return <CoursesPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'library':
        return <LibraryPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'focus-mode':
        return <FocusModePage theme={theme} setCurrentPage={setCurrentPage} />;
      default:
        return <ComingSoonPage pageName={currentPage} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Selector */}
      {currentPage === 'dashboard' && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Theme:</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={theme === 'ice-bear' ? 'default' : 'outline'}
                onClick={() => setTheme('ice-bear')}
                className="text-xs"
              >
                🐻‍❄️ Ice
              </Button>
              <Button
                size="sm"
                variant={theme === 'grizzly' ? 'default' : 'outline'}
                onClick={() => setTheme('grizzly')}
                className="text-xs"
              >
                🐻 Grizzly
              </Button>
              <Button
                size="sm"
                variant={theme === 'panda' ? 'default' : 'outline'}
                onClick={() => setTheme('panda')}
                className="text-xs"
              >
                🐼 Panda
              </Button>
            </div>
          </Card>
        </div>
      )}

      {renderCurrentPage()}
    </div>
  );
};

// Placeholder components for different pages

const CoursesPage = ({ theme, setCurrentPage }: { theme: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-6xl mx-auto">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
        ← Back to Dashboard
      </Button>
      <Card className="p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6">📕 Courses & Classes</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage your courses, track assignments, and monitor your academic progress.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Mathematics 101', progress: 75, nextClass: 'Tomorrow 9:00 AM' },
            { name: 'Computer Science', progress: 60, nextClass: 'Today 2:00 PM' },
            { name: 'Literature', progress: 90, nextClass: 'Friday 11:00 AM' },
          ].map((course, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-xl font-semibold mb-4">{course.name}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next: {course.nextClass}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const LibraryPage = ({ theme, setCurrentPage }: { theme: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-6xl mx-auto">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
        ← Back to Dashboard
      </Button>
      <Card className="p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6">📚 Study Library</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your curated collection of study resources, books, and materials.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Calculus Textbook', type: 'PDF', size: '12.5 MB' },
            { title: 'Physics Notes', type: 'DOC', size: '2.1 MB' },
            { title: 'History Research', type: 'PDF', size: '8.3 MB' },
            { title: 'Chemistry Lab Manual', type: 'PDF', size: '15.2 MB' },
          ].map((resource, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="font-semibold mb-2">{resource.title}</h3>
              <div className="text-sm text-muted-foreground">
                <p>{resource.type} • {resource.size}</p>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const FocusModePage = ({ theme, setCurrentPage }: { theme: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto text-center">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
        ← Back to Dashboard
      </Button>
      <Card className="p-12">
        <h1 className="text-4xl font-bold mb-6">🎯 Focus Mode</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Block distracting apps and websites to maintain deep focus during study sessions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">📱 App Blocking</h3>
            <p className="text-muted-foreground mb-4">
              Automatically block social media and distracting apps during focus sessions.
            </p>
            <Button className="w-full">Configure Apps</Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">🌐 Website Filtering</h3>
            <p className="text-muted-foreground mb-4">
              Block distracting websites and allow only study-related content.
            </p>
            <Button className="w-full">Set Filters</Button>
          </Card>
        </div>
        
        <p className="text-lg text-muted-foreground">
          <strong>Note:</strong> For full app blocking functionality, you'll need to install our mobile app 
          or browser extension. The web version provides website filtering only.
        </p>
      </Card>
    </div>
  </div>
);

const ComingSoonPage = ({ pageName, setCurrentPage }: { pageName: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto text-center">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">
        ← Back to Dashboard
      </Button>
      <Card className="p-12">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-4xl font-bold mb-6">Coming Soon!</h1>
        <p className="text-xl text-muted-foreground">
          The <strong>{pageName.replace('-', ' ')}</strong> feature is under development. 
          Check back soon for updates!
        </p>
      </Card>
    </div>
  </div>
);

export default Index;
