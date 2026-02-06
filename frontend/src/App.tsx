import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Produtos from './pages/Produtos';
import Perfil from './pages/Perfil'; 
import AdminDashboard from './pages/AdminDashboard'; 
import Register from './pages/Register';
import Checkout from './pages/Checkout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<Perfil />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkout" element={<Checkout />}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;