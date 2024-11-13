import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Room from './pages/Room';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from '../src/components/ProtectedRoute';
import './styles/main.scss';

// Importa el SDK de Datadog RUM
import { datadogRum } from '@datadog/browser-rum';

function App() {
  useEffect(() => {
    // Inicializa Datadog RUM
    datadogRum.init({
      applicationId: 'dfcbfabe-6141-4b4c-b5a2-cba59155847a',
      clientToken: 'pub1545a865890f72ab861059a7e1adeed5',
      site: 'us5.datadoghq.com', // Si es de la región US
      service: 'mit_test',
      env: 'development',
      sessionSampleRate: 100, // Tasa de muestreo de sesiones
      sessionReplaySampleRate: 20, // Tasa de muestreo para grabación de sesiones
      trackUserInteractions: true, // Habilita el rastreo de interacciones
      trackResources: true, // Habilita el rastreo de recursos
      trackLongTasks: true, // Habilita el rastreo de tareas largas
      defaultPrivacyLevel: 'mask-user-input', // Niveles de privacidad (enmascarar entradas del usuario)
    });

    // Inicia la grabación de la sesión
    datadogRum.startSessionReplayRecording(); 

  }, []);

  return (
    <UserProvider>
      {/* Solo un Router envolviendo toda la estructura */}
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

const AppRoutes = () => {
  const { userProfile, login, logout } = useUser();

  return (
    <div className='app'>
      <Routes>
        <Route path="/" element={userProfile ? <Navigate to={`/room/${userProfile?.username}`} /> : <Home />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/signup" element={<SignUp onSignUp={login} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/room/:username" element={<ProtectedRoute><Room handleLogout={logout} /></ProtectedRoute>} />
        <Route path="/admin/:username" element={<ProtectedRoute><Admin handleLogout={logout} /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
