import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuickDemoBar } from './components/QuickDemoBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { LandingPage } from './views/LandingPage';
import { LoginRegisterView } from './views/LoginRegisterView';
import { CitizenDashboard } from './views/CitizenDashboard';
import { NewComplaintView } from './views/NewComplaintView';
import { MyComplaintsView } from './views/MyComplaintsView';
import { ComplaintDetailsView } from './views/ComplaintDetailsView';
import { PublicExplorerView } from './views/PublicExplorerView';
import { CommunityClustersView } from './views/CommunityClustersView';
import { CivicRiskRadarView } from './views/CivicRiskRadarView';
import { NotificationsView } from './views/NotificationsView';
import { OfficerDashboard } from './views/OfficerDashboard';
import { OfficerReviewQueueView } from './views/OfficerReviewQueueView';
import { DepartmentManagementView } from './views/DepartmentManagementView';
import { ClusterManagementView } from './views/ClusterManagementView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { UserProfileAccessibilityView } from './views/UserProfileAccessibilityView';
import { PrivacyHelpView } from './views/PrivacyHelpView';
import { ProjectInfoDemoGuideView } from './views/ProjectInfoDemoGuideView';

const AppContent: React.FC = () => {
  const { user, highContrast } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>('cmp-pothole-eng');

  const handleNavigate = (tab: string, complaintId?: string) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage onSelectTab={handleNavigate} />;

      case 'auth':
        return <LoginRegisterView onSuccess={() => handleNavigate('citizen-dashboard')} />;

      case 'citizen-dashboard':
        return <CitizenDashboard onSelectTab={handleNavigate} />;

      case 'new-complaint':
        return (
          <NewComplaintView
            onSuccess={(id) => handleNavigate('complaint-detail', id)}
            onCancel={() => handleNavigate('citizen-dashboard')}
          />
        );

      case 'my-complaints':
        return (
          <MyComplaintsView
            onSelectComplaint={(id) => handleNavigate('complaint-detail', id)}
            onNewComplaint={() => handleNavigate('new-complaint')}
          />
        );

      case 'complaint-detail':
        return (
          <ComplaintDetailsView
            complaintId={selectedComplaintId || 'cmp-pothole-eng'}
            onBack={() => handleNavigate(user?.role === 'officer' ? 'officer-dashboard' : 'my-complaints')}
          />
        );

      case 'public-explorer':
        return <PublicExplorerView onSelectComplaint={(id) => handleNavigate('complaint-detail', id)} />;

      case 'community-clusters':
        return (
          <CommunityClustersView
            onSelectComplaint={(id) => handleNavigate('complaint-detail', id)}
            onNewComplaint={() => handleNavigate('new-complaint')}
          />
        );

      case 'civic-radar':
        return <CivicRiskRadarView />;

      case 'notifications':
        return <NotificationsView onNavigateToComplaint={(id) => handleNavigate('complaint-detail', id)} />;

      case 'officer-dashboard':
        return (
          <OfficerDashboard
            onSelectComplaint={(id) => handleNavigate('complaint-detail', id)}
            onNavigateTab={handleNavigate}
          />
        );

      case 'officer-queue':
        return (
          <OfficerReviewQueueView
            onSelectComplaint={(id) => handleNavigate('complaint-detail', id)}
            onBack={() => handleNavigate('officer-dashboard')}
          />
        );

      case 'departments':
        return <DepartmentManagementView />;

      case 'clusters-management':
        return <ClusterManagementView />;

      case 'admin-dashboard':
        return <AdminDashboardView />;

      case 'profile':
        return <UserProfileAccessibilityView onLogout={() => handleNavigate('landing')} />;

      case 'privacy-help':
        return <PrivacyHelpView />;

      case 'demo-guide':
        return <ProjectInfoDemoGuideView onNavigateTab={handleNavigate} />;

      default:
        return <LandingPage onSelectTab={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#090d16] text-slate-100 ${highContrast ? 'contrast-125' : ''}`}>
      {/* Hackathon 1-Click Evaluation Bar */}
      <QuickDemoBar onNavigate={handleNavigate} />

      {/* Main Navigation */}
      <Navbar currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* View Content */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onSelectTab={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
