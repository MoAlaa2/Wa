
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';

// Pages
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/Analytics';
import InboxPage from './pages/Inbox';
import OrdersPage from './pages/Orders';
import TemplatesPage from './pages/ContentLibrary/Templates';
import FlowsPage from './pages/ContentLibrary/Flows';
import QuickRepliesPage from './pages/ContentLibrary/QuickReplies';
import AutoRepliesPage from './pages/Automation/AutoReplies';
import ChatbotBuilderPage from './pages/Automation/ChatbotBuilder';
import KnowledgeBasePage from './pages/Automation/KnowledgeBase';
import SettingsPage from './pages/Settings';
import NotificationsPage from './pages/Notifications';
import NotificationForm from './pages/Notifications/NotificationForm';
import InternalNotificationsPage from './pages/InternalNotifications';

// Contact Pages
import ContactsPage from './pages/Contacts/ContactsPage';
import ContactListsPage from './pages/Contacts/ListsPage';
import ContactTagsPage from './pages/Contacts/TagsPage';
import ContactSegmentsPage from './pages/Contacts/SegmentsPage';
import ContactImportPage from './pages/Contacts/ImportPage';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <HashRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Analytics */}
                <Route path="/analytics/:type" element={<AnalyticsPage />} />

                <Route path="/inbox" element={<InboxPage />} />
                
                {/* Orders */}
                <Route path="/orders" element={<OrdersPage />} />

                {/* Notifications / Campaigns */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/notifications/new" element={<NotificationForm />} />
                <Route path="/notifications/edit/:id" element={<NotificationForm />} />

                {/* Internal Notifications (History) */}
                <Route path="/internal-notifications" element={<InternalNotificationsPage />} />

                {/* Contacts Module */}
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/contacts/lists" element={<ContactListsPage />} />
                <Route path="/contacts/tags" element={<ContactTagsPage />} />
                <Route path="/contacts/segments" element={<ContactSegmentsPage />} />
                <Route path="/contacts/import" element={<ContactImportPage />} />

                {/* Content Library */}
                <Route path="/content/templates" element={<TemplatesPage />} />
                <Route path="/content/flows" element={<FlowsPage />} />
                <Route path="/content/quick-replies" element={<QuickRepliesPage />} />
                
                {/* Automation */}
                <Route path="/automation/auto-replies" element={<AutoRepliesPage />} />
                <Route path="/automation/chatbot" element={<ChatbotBuilderPage />} />
                <Route path="/automation/knowledge-base" element={<KnowledgeBasePage />} />
                
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
