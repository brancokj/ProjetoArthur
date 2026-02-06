import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Busca os dados do usuário logado
    axios.get('http://localhost:8080/api/usuarios/me', {
       headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        setUsuario(response.data);
    })
    .catch(err => {
        console.error("Erro ao buscar perfil", err);
        // Se der 403/401, o token venceu
        if(err.response?.status === 403) navigate('/');
    });
  }, [navigate]);

  if (!usuario) return <div className="p-5 text-center">Carregando perfil...</div>;

  return (
    <div className="min-h-screen bg-light p-4">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body text-center p-5">
            <h1 className="fw-bold text-primary mb-1">{usuario.nome}</h1>
            <p className="text-muted">{usuario.admin ? 'Administrador' : 'Cliente'}</p>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-bold">Dados Pessoais</div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between">
              <span className="text-muted">E-mail:</span>
              <span className="fw-semibold">{usuario.email}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span className="text-muted">Documento:</span>
              <span className="fw-semibold">{usuario.cpf || usuario.cnpj || '-'}</span>
            </li>
            
            {/* AQUI É O TESTE DE FOGO DO ENDEREÇO */}
            <li className="list-group-item">
              <div className="text-muted mb-1">Endereço Completo:</div>
              <div className="fw-bold text-dark p-2 bg-light rounded border">
                {usuario.endereco}
              </div>
            </li>
            
            <li className="list-group-item d-flex justify-content-between">
              <span className="text-muted">CEP:</span>
              <span>{usuario.cep}</span>
            </li>
          </ul>
        </div>

        <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} 
          className="btn btn-outline-danger w-100 mt-4">
          Sair da Conta
        </button>

      </div>
    </div>
  );
}

export default Perfil