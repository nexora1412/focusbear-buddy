import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FocusTimer } from '@/components/FocusTimer';
import { TasksPage } from '@/components/TasksPage';
import { NotebooksPage } from '@/components/NotebooksPage';
import { HabitsPage } from '@/components/HabitsPage';
import { IdeasPage } from '@/components/IdeasPage';
import { AssignmentsPage } from '@/components/AssignmentsPage';
import { CoursesPage } from '@/components/CoursesPage';
import { VisionBoardPage } from '@/components/VisionBoardPage';
import { LibraryPage } from '@/components/LibraryPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('panda');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('focusbear-theme');
    const savedDarkMode = localStorage.getItem('focusbear-darkmode');
    if (savedTheme) setTheme(savedTheme);
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

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
      case 'todo':
        return <TasksPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'brain-dump':
        return <IdeasPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'habit-tracker':
        return <HabitsPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'assignments':
        return <AssignmentsPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'courses':
        return <CoursesPage theme={theme} setCurrentPage={setCurrentPage} />;
      case 'vision-board':
        return <VisionBoardPage theme={theme} setCurrentPage={setCurrentPage} />;
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
      {currentPage === 'dashboard' && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Theme:</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={theme === 'ice-bear' ? 'default' : 'outline'} onClick={() => setTheme('ice-bear')} className="text-xs">🐻‍❄️ Ice</Button>
              <Button size="sm" variant={theme === 'grizzly' ? 'default' : 'outline'} onClick={() => setTheme('grizzly')} className="text-xs">🐻 Grizzly</Button>
              <Button size="sm" variant={theme === 'panda' ? 'default' : 'outline'} onClick={() => setTheme('panda')} className="text-xs">🐼 Panda</Button>
            </div>
          </Card>
        </div>
      )}
      {renderCurrentPage()}
    </div>
  );
};

const FocusModePage = ({ theme, setCurrentPage }: { theme: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto text-center">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">← Back to Dashboard</Button>
      <Card className="p-12">
        <h1 className="text-4xl font-bold mb-6">🎯 Focus Mode</h1>
        <p className="text-xl text-muted-foreground mb-8">Block distracting apps and websites during study sessions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">📱 App Blocking</h3>
            <p className="text-muted-foreground mb-4">Automatically block social media during focus sessions.</p>
            <Button className="w-full">Configure Apps</Button>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">🌐 Website Filtering</h3>
            <p className="text-muted-foreground mb-4">Block distracting websites and allow only study content.</p>
            <Button className="w-full">Set Filters</Button>
          </Card>
        </div>
      </Card>
    </div>
  </div>
);

const ComingSoonPage = ({ pageName, setCurrentPage }: { pageName: string; setCurrentPage: (page: string) => void }) => (
  <div className="min-h-screen bg-background p-8">
    <div className="max-w-4xl mx-auto text-center">
      <Button onClick={() => setCurrentPage('dashboard')} className="mb-8">← Back to Dashboard</Button>
      <Card className="p-12">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-4xl font-bold mb-6">Coming Soon!</h1>
        <p className="text-xl text-muted-foreground">
          The <strong>{pageName.replace('-', ' ')}</strong> feature is under development.
        </p>
      </Card>
    </div>
  </div>
);

export default Index;
