import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEbook from './pages/CreateEbook';
import EditEbook from './pages/EditEbook';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position='top-right' />
        <Routes>
          <Route path='/login'     element={<Login />} />
          <Route path='/register'  element={<Register />} />
          <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path='/create'    element={<PrivateRoute><CreateEbook /></PrivateRoute>} />
          <Route path='/edit/:id'  element={<PrivateRoute><EditEbook /></PrivateRoute>} />
          <Route path='*'          element={<Navigate to='/login' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
