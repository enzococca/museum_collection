import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CollectionPage } from './pages/CollectionPage';
import { ArtifactDetailPage } from './pages/ArtifactDetailPage';
import { ArtifactEditPage } from './pages/ArtifactEditPage';
import { SearchPage } from './pages/SearchPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UploadPage } from './pages/UploadPage';
import { ExportPage } from './pages/ExportPage';
import { UsersPage } from './pages/UsersPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { PublicSubmissionPage } from './pages/PublicSubmissionPage';
import { HelpPage } from './pages/HelpPage';
import { ThesaurusPage } from './pages/ThesaurusPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/submit" element={<PublicSubmissionPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/artifact/:id" element={<ArtifactDetailPage />} />
              <Route
                path="/artifact/:id/edit"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'editor']}>
                    <ArtifactEditPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/help" element={<HelpPage />} />

              {/* Editor routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'editor']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submissions"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'editor']}>
                    <SubmissionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/export"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <ExportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/thesaurus"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <ThesaurusPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Unauthorized */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-4">You don't have permission to access this page.</p>
                    <a href="/" className="text-primary-600 hover:underline">Go to Dashboard</a>
                  </div>
                </div>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
