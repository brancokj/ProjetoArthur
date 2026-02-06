import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        email,
        senha
      });

      localStorage.setItem('token', response.data.token);
      navigate('/produtos');

    } catch (error) {
      setErro('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <Container style={{ maxWidth: '400px' }}>
        <Card className="shadow-lg border-0 p-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">Estoque Pro</h2>
              <p className="text-muted">Acesse sua conta para continuar</p>
            </div>

            {erro && <Alert variant="danger">{erro}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>E-mail Corporativo</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ex: admin@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 btn-lg" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Entrar no Sistema'}
              </Button>
              <div className="text-center mt-3">
                <small>Não tem conta? <a href="/register" className="fw-bold text-decoration-none">Registre-se</a></small>
              </div>
            </Form>
          </Card.Body>
          <Card.Footer className="text-center bg-white border-0 text-muted mt-2">
            <small>Sistema Seguro v1.0</small>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
}

export default Login;