import { Routes, Route, Navigate } from "react-router-dom";
import { TaskContainer }  from "./TaskContainer";
import { Register }       from "./components/register/register";
import { Login }          from "./components/login/login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InvitePage }     from "./components/workspace/InvitePage";

function App() {
  return (
    <Routes>
      <Route path="/"        element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/invite/:token" element={<ProtectedRoute><InvitePage /></ProtectedRoute>} />
      <Route path="/tasks"   element={<ProtectedRoute><TaskContainer /></ProtectedRoute>} />
      <Route path="*"        element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
