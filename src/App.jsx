import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { TaskContainer } from "./TaskContainer";
import { Register } from "./components/register/register";
import { Login } from "./components/login/login";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    // <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskContainer />
            </ProtectedRoute>
          }
        />
      </Routes>
    // </Router>
  );
}

export default App;
