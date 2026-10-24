import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthFlow } from './components/Onboarding/AuthFlow';
import { HeaderBar } from './components/Navigation/HeaderBar';
import { LeftSidebarNav } from './components/Navigation/LeftSidebarNav';
import { InboxView } from './components/Inbox/InboxView';
import { ChatView } from './components/Chat/ChatView';
import { StatusView } from './components/Status/StatusView';
import { SettingsView } from './components/Settings/SettingsView';
import { ContactDetailsDrawer } from './components/Contact/ContactDetailsDrawer';
import { NewChatModal } from './components/Modals/NewChatModal';
import { CallModal } from './components/Calls/CallModal';
import { KeyVerificationModal } from './components/Differentiators/KeyVerificationModal';
import { MeshModeModal } from './components/Differentiators/MeshModeModal';
import { ProofOfHumanModal } from './components/Differentiators/ProofOfHumanModal';
import { ScamRadarInspector } from './components/Differentiators/ScamRadarInspector';
import { ReputationInspector } from './components/Differentiators/ReputationInspector';
import { OpsDashboard } from './components/Admin/OpsDashboard';
import { TrustGraphVisualizer } from './components/Differentiators/TrustGraphVisualizer';
import { DeepfakeAudioAnalyzer } from './components/Differentiators/DeepfakeAudioAnalyzer';
import { SafetyCenterModal } from './components/Differentiators/SafetyCenterModal';
import { UserProfilePage } from './components/Profile/UserProfilePage';
import { AdminConsolePage } from './components/Admin/AdminConsolePage';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { CallsHistoryView } from './components/Calls/CallsHistoryView';
import './styles/design-tokens.css';

const MainLayout: React.FC = () => {
  const { isAuthenticated, rooms, activeRoomId, isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'status' | 'channels' | 'settings' | 'profile' | 'admin'>('chats');
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const peerUser = activeRoom.members.find(m => m.id !== 'usr_me_001');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-app)',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar */}
      <HeaderBar 
        onToggleContactInfo={() => setShowContactDetails(prev => !prev)} 
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Main Workspace Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Real WhatsApp Leftmost App Navigation Bar */}
        <LeftSidebarNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'chats') setMobileShowChat(false);
          }} 
          onOpenNewChat={() => setShowNewChatModal(true)}
        />

        {/* Tab View Renderer */}
        {activeTab === 'chats' || activeTab === 'channels' ? (
          <>
            {(!isMobileScreen || !mobileShowChat) && (
              <InboxView onSelectRoom={() => {
                if (isMobileScreen) setMobileShowChat(true);
              }} />
            )}
            {(!isMobileScreen || mobileShowChat) && (
              <ChatView 
                onToggleContactInfo={() => setShowContactDetails(prev => !prev)} 
                onBackToInbox={isMobileScreen ? () => setMobileShowChat(false) : undefined}
              />
            )}
          </>
        ) : activeTab === 'calls' ? (
          <CallsHistoryView />
        ) : activeTab === 'status' ? (
          <StatusView />
        ) : activeTab === 'profile' ? (
          <UserProfilePage onClose={() => setActiveTab('chats')} />
        ) : (activeTab === 'admin' && isAdmin) ? (
          <AdminConsolePage onClose={() => setActiveTab('chats')} />
        ) : (
          <SettingsView onOpenProfile={() => setActiveTab('profile')} />
        )}

        {/* Contact Info Slide-Out Drawer */}
        {showContactDetails && peerUser && (
          <ContactDetailsDrawer user={peerUser} onClose={() => setShowContactDetails(false)} />
        )}
      </div>

      {/* Mobile Ergonomics Bottom Tab Bar */}
      <MobileBottomNav activeTab={activeTab as any} setActiveTab={setActiveTab as any} />

      {/* Modals & Overlays */}
      <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} />
      <SafetyCenterModal />
      <CallModal />
      <KeyVerificationModal />
      <MeshModeModal />
      <ProofOfHumanModal />
      <ScamRadarInspector />
      <ReputationInspector />
      <OpsDashboard />
      <TrustGraphVisualizer />
      <DeepfakeAudioAnalyzer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
