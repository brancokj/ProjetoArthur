import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

export function Perfil() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Estado do Formulário
    const [id, setId] = useState<number | null>(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState(''); // Será Read-Only
    const [endereco, setEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [senha, setSenha] = useState(''); // Opcional para troca

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        try {
            const res = await axios.get('http://localhost:8080/api/usuarios/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const u = res.data;
            setId(u.id);
            setNome(u.nome || '');
            setEmail(u.email || '');
            setTelefone(u.telefone || '');
            setCpf(u.cpf || u.cnpj || '');
            setEndereco(u.endereco || ''); // Se tiver endereço no DTO
            setCep(u.cep || ''); // Se tiver CEP no DTO
        } catch (error) {
            console.error(error);
            setMsg({ type: 'danger', text: 'Erro ao carregar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSalvar = async () => {
        if (!id) return;
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const payload = {
                nome,
                email,
                telefone,
                endereco,
                cep,
                senha: senha || undefined // Só envia se preencheu algo
            };

            await axios.put(`http://localhost:8080/api/usuarios/${id}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setSenha(''); // Limpa campo de senha
        } catch (error) {
            setMsg({ type: 'danger', text: 'Erro ao atualizar. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', paddingTop: '40px' }}>
            <Container style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-dark">👤 Meu Perfil</h2>
                    <Button variant="outline-dark" onClick={() => navigate('/produtos')}>Voltar para Loja</Button>
                </div>

                <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                        {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

                        {loading && !id ? (
                            <div className="text-center py-5"><Spinner animation="border" /></div>
                        ) : (
                            <Form>
                                <h5 className="mb-3 text-primary border-bottom pb-2">Informações Pessoais</h5>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">Nome Completo</Form.Label>
                                        <Form.Control type="text" value={nome} onChange={e => setNome(e.target.value)} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">CPF / Documento</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={cpf} 
                                            disabled // <--- IMPEDE A EDIÇÃO
                                            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                        />
                                        <Form.Text className="text-muted">O documento não pode ser alterado.</Form.Text>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">Email</Form.Label>
                                        <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">Telefone / Celular</Form.Label>
                                        <Form.Control type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(xx) xxxxx-xxxx" />
                                    </Col>
                                </Row>

                                <h5 className="mb-3 mt-4 text-primary border-bottom pb-2">Endereço</h5>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Label className="fw-bold">CEP</Form.Label>
                                        <Form.Control type="text" value={cep} onChange={e => setCep(e.target.value)} />
                                    </Col>
                                    <Col md={8}>
                                        <Form.Label className="fw-bold">Endereço Completo</Form.Label>
                                        <Form.Control type="text" value={endereco} onChange={e => setEndereco(e.target.value)} />
                                    </Col>
                                </Row>

                                <h5 className="mb-3 mt-4 text-danger border-bottom pb-2">Segurança</h5>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">Nova Senha</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={senha} 
                                            onChange={e => setSenha(e.target.value)} 
                                            placeholder="Deixe em branco para manter a atual" 
                                        />
                                    </Col>
                                </Row>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" size="lg" onClick={handleSalvar} disabled={loading}>
                                        {loading ? 'Salvando...' : '💾 Salvar Alterações'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Perfil;