import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState(''); // <--- STATE NOVO
  const [password, setPassword] = useState('');
  const [documento, setDocumento] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');           
  const [complemento, setComplemento] = useState(''); 
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Validação básica inclui telefone agora
    if(!nome || !email || !password || !cep || !numero || !telefone) {
      setError("Preencha os campos obrigatórios (*)");
      return;
    }
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        nome,
        email,
        telefone, // <--- ENVIANDO
        password,
        documento,
        cep,
        numero,        
        complemento    
      });

      alert('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.response) setError(`Erro: ${err.response.data || err.response.status}`);
      else setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="card shadow border-0 p-4 m-3" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Criar Conta</h2>
        </div>

        {error && <div className="alert alert-danger p-2 text-center small">{error}</div>}

        <div className="d-flex flex-column gap-3">
          
          <div>
            <label className="form-label fw-bold small">Nome Completo *</label>
            <input type="text" className="form-control" value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div className="row g-2">
            <div className="col-7">
                <label className="form-label fw-bold small">E-mail *</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="col-5">
                <label className="form-label fw-bold small">Telefone/Cel *</label>
                <input type="text" className="form-control" placeholder="(00) 00000-0000" value={telefone} onChange={e => setTelefone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label fw-bold small">CPF / CNPJ</label>
            <input type="text" className="form-control" value={documento} onChange={e => setDocumento(e.target.value)} />
          </div>

          <div className="row g-2">
            <div className="col-4">
              <label className="form-label fw-bold small">CEP *</label>
              <input type="text" className="form-control" placeholder="00000-000"
                value={cep} onChange={e => setCep(e.target.value)} />
            </div>
            <div className="col-4">
              <label className="form-label fw-bold small">Número *</label>
              <input type="text" className="form-control" placeholder="123"
                value={numero} onChange={e => setNumero(e.target.value)} />
            </div>
            <div className="col-4">
              <label className="form-label fw-bold small">Comp.</label>
              <input type="text" className="form-control" placeholder="Apto/Bl"
                value={complemento} onChange={e => setComplemento(e.target.value)} />
            </div>
          </div>
          <div className="form-text text-center mb-1" style={{ fontSize: '0.8rem' }}>* Buscamos a rua automaticamente</div>

          <div>
            <label className="form-label fw-bold small">Senha *</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="button" onClick={handleRegister} className="btn btn-primary w-100 fw-bold mt-2" disabled={loading}>
            {loading ? 'Enviando...' : 'CADASTRAR'}
          </button>
        </div>

        <div className="text-center mt-3">
          <small><Link to="/">Voltar para Login</Link></small>
        </div>
      </div>
    </div>
  );
}

export default Register;