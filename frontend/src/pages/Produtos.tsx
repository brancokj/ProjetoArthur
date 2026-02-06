import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Card, Button, Row, Col, Badge, Modal, Form, InputGroup } from 'react-bootstrap';

interface Produto {
    id: number;
    nome: string;
    preco: number;
    quantidade: number;
    categoria: string;
}

function Produtos() {
    // --- 1. HOOKS (Sempre DENTRO da função) ---
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [busca, setBusca] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // <--- O NOVO ESTADO AQUI
    const navigate = useNavigate();

    // Estados do Modal
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [qtdCompra, setQtdCompra] = useState(1);

    // --- 2. EFEITOS (Carregar dados ao abrir) ---
    useEffect(() => {
        carregarDados();
    }, [navigate]);

    const carregarDados = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Busca Produtos
        axios.get('http://localhost:8080/api/produtos', { headers })
        .then(response => {
            const dados = response.data.content ? response.data.content : response.data;
            setProdutos(Array.isArray(dados) ? dados : []);
        })
        .catch(() => navigate('/'));

        // Busca Dados do Usuário (Para saber se é Admin)
        axios.get('http://localhost:8080/api/usuarios/me', { headers })
        .then(response => {
            setIsAdmin(response.data.admin);
        })
        .catch(err => console.error("Erro ao verificar admin", err));
    };

    // --- 3. FUNÇÕES AUXILIARES ---
    const produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase())
    );

    const abrirModal = (p: Produto) => {
        setProdutoSelecionado(p);
        setQtdCompra(1);
        setShowModal(true);
    };

    const confirmarCompra = async () => {
        if (!produtoSelecionado) return;
        try {
            const token = localStorage.getItem('token');
            
            const vendaPayload = {
                itens: [
                    { 
                        idProduto: produtoSelecionado.id, 
                        quantidade: qtdCompra 
                    }
                ]
            };

            await axios.post('http://localhost:8080/api/vendas', vendaPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert("✅ Compra realizada!");
            carregarDados(); 
            setShowModal(false);
        } catch (error) {
            console.error(error); 
            alert("❌ Erro ao comprar.");
        }
    };

    // --- 4. O VISUAL (JSX) ---
    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* NAV BAR CORRIGIDA */}
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="fw-bold">📦 Estoque Pro</Navbar.Brand>
                    
                    <Nav className="ms-auto">
                        {/* BOTÃO DE ADMIN (Só aparece se for admin) */}
                        {isAdmin && (
                            <Button 
                                variant="warning" 
                                size="sm" 
                                className="me-2 fw-bold"
                                onClick={() => navigate('/admin')}
                            >
                                🛡️ Área Admin
                            </Button>
                        )}

                        <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-2" 
                            onClick={() => navigate('/perfil')}
                        >
                            👤 Meu Perfil
                        </Button>

                        <Button 
                            variant="outline-light" 
                            size="sm" 
                            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
                        >
                            Sair
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            {/* HERO SECTION */}
            <div className="bg-primary text-white py-5 mb-5 shadow">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 className="fw-bold">Bem-vindo à Loja</h1>
                            <p className="lead">Gerencie suas compras e verifique o estoque em tempo real.</p>
                        </Col>
                        <Col md={6}>
                            <InputGroup size="lg">
                                <Form.Control
                                    placeholder="🔍 Pesquisar produto ou categoria..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    style={{ borderRadius: '30px 0 0 30px', border: 'none' }}
                                />
                                <Button variant="light" style={{ borderRadius: '0 30px 30px 0' }}>Buscar</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* LISTA DE PRODUTOS */}
            <Container className="pb-5">
                <Row>
                    {produtosFiltrados.map(produto => (
                        <Col key={produto.id} lg={4} md={6} xs={12} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm hover-scale">
                                <Card.Body className="d-flex flex-column p-4">
                                    <div className="d-flex justify-content-between mb-3">
                                        <Badge bg="light" text="dark" className="border">
                                            {produto.categoria || 'Geral'}
                                        </Badge>
                                        <small className="text-muted">ID: #{produto.id}</small>
                                    </div>
                                    
                                    <Card.Title className="fw-bold fs-4 mb-3">{produto.nome}</Card.Title>
                                    
                                    <div className="mt-auto pt-3 border-top">
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <small className="text-muted d-block">Preço Unitário</small>
                                                <span className="text-primary fw-bold fs-3">R$ {produto.preco.toFixed(2)}</span>
                                            </div>
                                            <div className="text-end">
                                                <small className={`d-block fw-bold ${produto.quantidade > 0 ? 'text-success' : 'text-danger'}`}>
                                                    {produto.quantidade > 0 ? `${produto.quantidade} em estoque` : 'Esgotado'}
                                                </small>
                                                <Button 
                                                    variant="dark" 
                                                    className="mt-2 px-4"
                                                    disabled={produto.quantidade <= 0}
                                                    onClick={() => abrirModal(produto)}
                                                >
                                                    Comprar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* MODAL DE COMPRA */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Finalizar Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {produtoSelecionado && (
                        <div className="py-3">
                            <h5 className="text-primary mb-4">{produtoSelecionado.nome}</h5>
                            
                            <Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="m-0">Quantidade:</Form.Label>
                                    <span className="text-muted small">Disponível: {produtoSelecionado.quantidade}</span>
                                </div>
                                <Form.Control 
                                    type="number" 
                                    min="1" 
                                    max={produtoSelecionado.quantidade}
                                    value={qtdCompra} 
                                    onChange={(e) => setQtdCompra(parseInt(e.target.value))}
                                    size="lg"
                                />
                            </Form.Group>

                            <div className="bg-light p-3 rounded mt-3 d-flex justify-content-between">
                                <span>Total estimado:</span>
                                <strong className="fs-5">R$ {(produtoSelecionado.preco * qtdCompra).toFixed(2)}</strong>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="link" className="text-decoration-none text-muted" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" className="px-4" onClick={confirmarCompra}>Confirmar Compra</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Produtos;