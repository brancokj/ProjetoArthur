import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Badge, Row, Col } from 'react-bootstrap';

interface UsuarioDados {
    id: number;
    email: string;
    cpf?: string;
    cnpj?: string;
    admin: boolean;
}

function Perfil() {
    const [usuario, setUsuario] = useState<UsuarioDados | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Bate no backend para pegar os dados frescos
        axios.get('http://localhost:8080/api/usuarios/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setUsuario(response.data);
        })
        .catch(erro => {
            console.error("ERRO NO PERFIL:", erro);
            localStorage.removeItem('token');
            navigate('/');
        });
    }, [navigate]);

    if (!usuario) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Carregando perfil...</p>
            </Container>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', paddingTop: '50px' }}>
            <Container style={{ maxWidth: '600px' }}>
                <Card className="shadow border-0">
                    <div className="bg-primary text-white p-4 text-center rounded-top" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                            👤
                        </div>
                        <h3 className="fw-bold m-0">Meu Perfil</h3>
                        <p className="opacity-75">{usuario.admin ? 'Administrador' : 'Usuário Padrão'}</p>
                    </div>
                    
                    <Card.Body className="p-4">
                        <Row className="mb-3">
                            <Col sm={4} className="text-muted">E-mail</Col>
                            <Col sm={8} className="fw-bold">{usuario.email}</Col>
                        </Row>
                        <hr />

                        {/* Mostra CPF se tiver, ou CNPJ se tiver */}
                        {usuario.cpf && (
                            <Row className="mb-3">
                                <Col sm={4} className="text-muted">CPF</Col>
                                <Col sm={8}>{usuario.cpf}</Col>
                            </Row>
                        )}
                        
                        {usuario.cnpj && (
                            <Row className="mb-3">
                                <Col sm={4} className="text-muted">CNPJ</Col>
                                <Col sm={8}>{usuario.cnpj}</Col>
                            </Row>
                        )}
                        <hr />

                        <Row className="mb-4">
                            <Col sm={4} className="text-muted">Permissões</Col>
                            <Col sm={8}>
                                {usuario.admin 
                                    ? <Badge bg="danger">Acesso Total (Admin)</Badge> 
                                    : <Badge bg="success">Cliente / Vendedor</Badge>
                                }
                            </Col>
                        </Row>

                        <div className="d-grid gap-2">
                            <Button variant="outline-primary" onClick={() => navigate('/produtos')}>
                                ⬅ Voltar para Produtos
                            </Button>
                            <Button variant="outline-danger" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                                Sair da Conta
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Perfil;