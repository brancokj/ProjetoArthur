import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Checkout() {
  const [vendedor, setVendedor] = useState('');
  const [tipoAtendimento, setTipoAtendimento] = useState('NA_LOJA'); // Valor padrão
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinalizar = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:8080/api/vendas/finalizar', {
        vendedor: vendedor, // Se estiver vazio, o backend coloca "Venda Online"
        tipoAtendimento: tipoAtendimento,
        produtosIds: [1, 2] // Exemplo: aqui você mandaria os IDs do carrinho
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Compra realizada com sucesso!');
      navigate('/perfil'); // Manda pro perfil pra ver a compra
    } catch (error) {
      console.error(error);
      alert('Erro ao finalizar venda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light p-4 flex items-center justify-center">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="fw-bold text-primary mb-4 text-center">Finalizar Pedido</h2>

        {/* CAMPO VENDEDOR (OPCIONAL) */}
        <div className="mb-4">
          <label className="form-label fw-bold">Nome do Vendedor (Opcional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Deixe vazio se for compra online"
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
          />
          <div className="form-text">
            Se não preenchido, será registrado como <strong>Venda Online</strong>.
          </div>
        </div>

        {/* CAMPO TIPO DE ATENDIMENTO (RADIO BUTTONS) */}
        <div className="mb-4">
          <label className="form-label fw-bold d-block mb-2">Como deseja receber o serviço?</label>
          
          <div className="form-check card p-3 mb-2 border-primary-subtle">
            <input
              className="form-check-input"
              type="radio"
              name="tipoAtendimento"
              id="loja"
              value="NA_LOJA"
              checked={tipoAtendimento === 'NA_LOJA'}
              onChange={(e) => setTipoAtendimento(e.target.value)}
            />
            <label className="form-check-label w-100 stretched-link" htmlFor="loja">
              <strong>Vou até o local</strong>
              <div className="text-muted small">Eu me desloco até a loja/oficina.</div>
            </label>
          </div>

          <div className="form-check card p-3 border-primary-subtle">
            <input
              className="form-check-input"
              type="radio"
              name="tipoAtendimento"
              id="domicilio"
              value="DOMICILIO"
              checked={tipoAtendimento === 'DOMICILIO'}
              onChange={(e) => setTipoAtendimento(e.target.value)}
            />
            <label className="form-check-label w-100 stretched-link" htmlFor="domicilio">
              <strong>Equipe vai até mim</strong>
              <div className="text-muted small">Serviço realizado no meu endereço.</div>
            </label>
          </div>
        </div>

        <button 
          onClick={handleFinalizar}
          disabled={loading}
          className="btn btn-success w-100 py-3 fw-bold fs-5"
        >
          {loading ? 'Processando...' : 'CONFIRMAR COMPRA'}
        </button>
      </div>
    </div>
  );
}

export default Checkout;