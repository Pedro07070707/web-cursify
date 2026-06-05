import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import {
  AuthPage,
  CourseLessonPage,
  CoursesPage,
  DashboardPage,
  LibraryPage,
  ManagementPage,
  MessagesPage,
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  TracksPage,
} from './components/PromptPages';
import LandingPageClassic from './components/LandingPageClassic';
import { useCursiFy } from './context/CursiFyContext';
import './App.css';

function RootRoute() {
  const { authUser } = useCursiFy();

  if (authUser) {
    const role = authUser.nivelAcesso || authUser.role;
    if (role === 'PROFESSOR') return <Navigate to="/professor/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPageClassic />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/cadastro" element={<AuthPage mode="cadastro" />} />
        <Route path="/register" element={<Navigate to="/cadastro" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/meus-cursos" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/biblioteca" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="/notificacoes" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/cursos/:id" element={<CoursesPage />} />
        <Route path="/curso/:id/aula/:aulaId" element={<ProtectedRoute><CourseLessonPage /></ProtectedRoute>} />

        <Route path="/trilhas" element={<TracksPage />} />
        <Route path="/trilhas/:id" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />
        <Route path="/trilhas/:id/no/:noId" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />

        <Route path="/mensagens" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/mensagens/:conversaId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/mensagens/nova/:usuarioId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

        <Route path="/professor/dashboard" element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']}><ManagementPage title="Dashboard do professor" subtitle="Professor" /></ProtectedRoute>} />
        <Route path="/professor/cursos" element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']}><ManagementPage title="Cursos do professor" subtitle="Professor" /></ProtectedRoute>} />
        <Route path="/professor/alunos" element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']}><ManagementPage title="Alunos" subtitle="Professor" /></ProtectedRoute>} />
        <Route path="/professor/avaliacoes" element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']}><ManagementPage title="Avaliacoes" subtitle="Professor" /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Dashboard administrativo" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Usuarios" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/cursos" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Cursos" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/categorias" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Categorias" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/trilhas" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Trilhas" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/relatorios" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Relatorios" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/configuracoes" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Configuracoes" subtitle="Admin" /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute roles={['ADMIN']}><ManagementPage title="Moderacao do chat" subtitle="Admin" /></ProtectedRoute>} />

        <Route path="/student" element={<Navigate to="/dashboard" replace />} />
        <Route path="/teacher" element={<Navigate to="/professor/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/chat" element={<Navigate to="/mensagens" replace />} />
        <Route path="/profile" element={<Navigate to="/perfil" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
