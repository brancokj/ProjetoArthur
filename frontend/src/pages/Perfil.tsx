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
    const [cpf, setCpf] = useState(''); 
    const [endereco, setEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [senha, setSenha] = useState(''); 
    const [isAdmin, setIsAdmin] = useState(false);

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
            setEndereco(u.endereco || ''); 
            setCep(u.cep || '');
            setIsAdmin(u.admin);
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
                senha: senha || undefined 
            };

            await axios.put(`http://localhost:8080/api/usuarios/${id}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setSenha(''); 
        } catch (error) {
            setMsg({ type: 'danger', text: 'Erro ao atualizar. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    // CLASSE PARA BORDAS MAIS GROSSAS E VISÍVEIS
    const inputClass = "border border-2 border-secondary shadow-sm fw-bold";

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8', paddingTop: '40px' }}>
            <Container style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-dark">👤 Meu Perfil</h2>
                    <Button variant="outline-dark" onClick={() => navigate('/produtos')}>Voltar para Loja</Button>
                </div>

                {/* ADICIONADO: bg-warning bg-opacity-10 para o fundo amarelo claro */}
                <Card className="shadow border-0 bg-warning bg-opacity-10">
                    <Card.Body className="p-4">
                        {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

                        {loading && !id ? (
                            <div className="text-center py-5"><Spinner animation="border" /></div>
                        ) : (
                            <Form>
                                <div className="text-center mb-4">
                                    <div className="bg-white border border-3 border-warning rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" style={{width: '70px', height: '70px', fontSize: '28px'}}>
                                        {nome.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="mt-2 fw-bold text-dark">{nome}</h4>
                                    <span className="badge bg-dark">{isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}</span>
                                </div>

                                <h5 className="mb-3 text-dark border-bottom border-secondary pb-2">Informações Pessoais</h5>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold text-dark">Nome Completo</Form.Label>
                                        <Form.Control type="text" value={nome} onChange={e => setNome(e.target.value)} className={inputClass} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold text-dark">CPF / Documento</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={cpf} 
                                            disabled 
                                            className="border border-2 border-secondary shadow-sm"
                                            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                        />
                                        <Form.Text className="text-muted fw-bold" style={{fontSize: '0.75rem'}}>O documento não pode ser alterado.</Form.Text>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold text-dark">Email</Form.Label>
                                        <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="fw-bold text-dark">Telefone / Celular</Form.Label>
                                        <Form.Control type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(xx) xxxxx-xxxx" className={inputClass} />
                                    </Col>
                                </Row>

                                <h5 className="mb-3 mt-4 text-dark border-bottom border-secondary pb-2">Endereço de Entrega</h5>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Label className="fw-bold text-dark">CEP</Form.Label>
                                        <Form.Control type="text" value={cep} onChange={e => setCep(e.target.value)} className={inputClass} />
                                    </Col>
                                    <Col md={8}>
                                        <Form.Label className="fw-bold text-dark">Endereço Completo</Form.Label>
                                        <Form.Control type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className={inputClass} />
                                    </Col>
                                </Row>

                                <h5 className="mb-3 mt-4 text-danger border-bottom border-danger pb-2">Segurança</h5>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold text-dark">Nova Senha</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={senha} 
                                            onChange={e => setSenha(e.target.value)} 
                                            placeholder="Deixe em branco para manter a atual" 
                                            className={inputClass}
                                        />
                                    </Col>
                                </Row>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" size="lg" className="fw-bold shadow" onClick={handleSalvar} disabled={loading}>
                                        {loading ? 'Salvando...' : '💾 Salvar Alterações'}
                                    </Button>
                                    <Button variant="outline-danger" className="mt-2 fw-bold" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                                        Sair da Conta
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