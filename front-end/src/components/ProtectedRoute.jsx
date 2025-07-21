import { Navigate } from 'react-router-dom';

 export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('access_token'); // Ou vérifiez un cookie
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
//export default ProtectedRoute;