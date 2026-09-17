import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/AppLayout';
import { LanguageProvider } from '@/lib/i18n';
import Home from '@/pages/Home';
import TimelinePage from '@/pages/TimelinePage';
import UsersPage from '@/pages/UsersPage';
import SettingsPage from '@/pages/SettingsPage';
import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';
import Messages from '@/pages/Messages';
import Chat from '@/pages/Chat';
import PostDetail from '@/pages/PostDetail';
import LikersPage from '@/pages/LikersPage';
import BlockedUsersPage from '@/pages/BlockedUsersPage';
import TermsPage from '@/pages/TermsPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPage from '@/pages/PrivacyPage';
import MePage from '@/pages/MePage';
import ActivityPage from '@/pages/ActivityPage';
import SupportPage from '@/pages/SupportPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TimelineHidePage from '@/pages/TimelineHidePage';
import FavoritesPage from '@/pages/FavoritesPage';
import MutedUsersPage from '@/pages/MutedUsersPage';
import NotificationsPage from '@/pages/NotificationsPage';
import CreatePost from '@/pages/CreatePost';
import RecordWorkout from '@/pages/RecordWorkout';
import HomeNotificationsPage from '@/pages/HomeNotificationsPage';
import FollowListPage from '@/pages/FollowListPage';
import LoginMethodPage from '@/pages/LoginMethodPage';
import DeleteAccountConfirm from '@/pages/DeleteAccountConfirm';
import DeleteAccountVerify from '@/pages/DeleteAccountVerify';
import DeleteAccountFinal from '@/pages/DeleteAccountFinal';
import RestoreAccount from '@/pages/RestoreAccount';
import LogoutPage from '@/pages/LogoutPage';
import ChangeEmailPage from '@/pages/ChangeEmailPage';
import ReportPage from '@/pages/ReportPage';
import BirthdateOnboarding from '@/pages/BirthdateOnboarding';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Chat />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/:id/likers" element={<LikersPage />} />
          <Route path="/blocked-users" element={<BlockedUsersPage />} />
          <Route path="/timeline-hide" element={<TimelineHidePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/muted-users" element={<MutedUsersPage />} />
          <Route path="/users/:id/follows/:type" element={<FollowListPage />} />
          <Route path="/login-method" element={<LoginMethodPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/home-notifications" element={<HomeNotificationsPage />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/record-workout" element={<RecordWorkout />} />
          <Route path="/delete-account/confirm" element={<DeleteAccountConfirm />} />
          <Route path="/delete-account/verify" element={<DeleteAccountVerify />} />
          <Route path="/delete-account/final" element={<DeleteAccountFinal />} />
          <Route path="/restore-account" element={<RestoreAccount />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/change-email" element={<ChangeEmailPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/onboarding/birthdate" element={<BirthdateOnboarding />} />
          </Route>
          </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App