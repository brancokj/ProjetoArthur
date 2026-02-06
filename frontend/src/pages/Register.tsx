import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

function Register() {
    const [email, setEmail] = useState('');
    const [documento, setDocumento] = useState(''); // CPF ou CNPJ
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações básicas no Front
        if (password !== confirmPassword) {
            setError("As senhas não coincidem!");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        try {
            await axios.post('http://localhost:8080/auth/register', {
                email,
                password,
                documento
            });

            alert("✅ Conta criada com sucesso! Faça login agora.");
            navigate('/'); // Manda de volta pro login

        } catch (err) {
            setError("Erro ao cadastrar. Verifique se o e-mail já existe.");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Card className="shadow-lg border-0" style={{ width: '400px' }}>
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-primary">Crie sua Conta</h3>
                        <p className="text-muted small">Junte-se ao nosso sistema de estoque</p>
                    </div>

                    {error && <Alert variant="danger" className="py-2 text-center small">{error}</Alert>}

                    <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3">
                            <Form.Label>E-mail</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="exemplo@email.com" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>CPF ou CNPJ</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Digite apenas números" 
                                value={documento}
                                onChange={e => setDocumento(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="******" 
                                required 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirmar Senha</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="******" 
                                required 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 mb-3 fw-bold">
                            CADASTRAR
                        </Button>
                    </Form>

                    <div className="text-center border-top pt-3">
                        <small className="text-muted">Já tem uma conta? </small>
                        <Button variant="link" className="p-0 fw-bold text-decoration-none" onClick={() => navigate('/')}>
                            Fazer Login
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register;