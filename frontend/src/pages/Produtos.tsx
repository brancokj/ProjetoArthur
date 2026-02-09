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
    // --- 1. HOOKS ---
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [busca, setBusca] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Estados do Modal de Compra
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [qtdCompra, setQtdCompra] = useState(1);

    // Estados da Venda (Apenas Tipo)
    const [tipoAtendimento, setTipoAtendimento] = useState<'NA_LOJA' | 'DOMICILIO'>('NA_LOJA'); 

    // --- 2. EFEITOS ---
    useEffect(() => {
        carregarDados();
    }, [navigate]);

    const carregarDados = () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Busca Produtos
        axios.get('http://localhost:8080/api/produtos', { headers })
        .then(res => {
            const dados = res.data.content ? res.data.content : res.data;
            setProdutos(Array.isArray(dados) ? dados : []);
        }).catch(() => navigate('/'));

        // 2. Busca Usuário (Para mostrar botão Admin)
        axios.get('http://localhost:8080/api/usuarios/me', { headers })
        .then(res => setIsAdmin(res.data.admin))
        .catch(err => console.error(err));
    };

    const abrirModal = (p: Produto) => {
        setProdutoSelecionado(p);
        setQtdCompra(1);
        setTipoAtendimento('NA_LOJA'); // Reseta para padrão
        setShowModal(true);
    };

    const confirmarCompra = async () => {
        if (!produtoSelecionado) return;
        try {
            const token = localStorage.getItem('token');
            
            // Lógica Simplificada:
            // O cliente apenas diz se quer entrega ou não.
            // O Admin decidirá a equipa depois.
            let vendedorInicial = '';
            
            if (tipoAtendimento === 'DOMICILIO') {
                vendedorInicial = 'Equipe Externa (Não especificada)'; // O Admin vai alterar isso depois
            } else {
                vendedorInicial = 'Venda Online';
            }

            const vendaPayload = {
                vendedor: vendedorInicial,
                tipoAtendimento: tipoAtendimento,
                itens: [
                    { idProduto: produtoSelecionado.id, quantidade: qtdCompra }
                ]
            };

            await axios.post('http://localhost:8080/api/vendas/finalizar', vendaPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert(`✅ Compra realizada com sucesso!\n\nSeu pedido de ${tipoAtendimento === 'DOMICILIO' ? 'Instalação em Domicílio' : 'Retirada na Loja'} foi registrado.`);
            carregarDados(); 
            setShowModal(false);
        } catch (error: any) {
            console.error(error); 
            const msg = error.response?.data || "Erro ao realizar venda.";
            alert("❌ " + msg);
        }
    };

    // --- 3. VISUAL ---
    const produtosFiltrados = produtos.filter(p => 
        p.nome?.toLowerCase().includes(busca.toLowerCase()) || 
        p.categoria?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* --- NAVBAR --- */}
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="fw-bold">📦 Estoque Pro</Navbar.Brand>
                    <Nav className="ms-auto gap-2">
                        
                        {/* BOTÃO PERFIL (NOVO) */}
                        <Button variant="outline-info" size="sm" className="fw-bold" onClick={() => navigate('/perfil')}>
                            👤 Meu Perfil
                        </Button>

                        {/* BOTÃO ADMIN (Só aparece se for admin) */}
                        {isAdmin && (
                            <Button variant="warning" size="sm" className="fw-bold" onClick={() => navigate('/admin')}>
                                🛡️ Painel Admin
                            </Button>
                        )}
                        
                        {/* BOTÃO SAIR */}
                        <Button variant="outline-light" size="sm" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                            Sair
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            {/* --- HERO / BUSCA --- */}
            <div className="bg-primary text-white py-5 mb-5 shadow">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 className="fw-bold">Catálogo de Produtos</h1>
                            <p className="lead">Selecione os itens para compra ou agendamento.</p>
                        </Col>
                        <Col md={6}>
                            <InputGroup size="lg">
                                <Form.Control 
                                    placeholder="🔍 Buscar..." 
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

            {/* --- LISTA DE PRODUTOS --- */}
            <Container className="pb-5">
                <Row>
                    {produtosFiltrados.map(produto => (
                        <Col key={produto.id} lg={4} md={6} xs={12} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm hover-scale">
                                <Card.Body className="d-flex flex-column p-4">
                                    <div className="d-flex justify-content-between mb-3">
                                        <Badge bg="light" text="dark" className="border">{produto.categoria || 'Geral'}</Badge>
                                        <small className="text-muted">ID: #{produto.id}</small>
                                    </div>
                                    <Card.Title className="fw-bold fs-4 mb-3">{produto.nome}</Card.Title>
                                    {/* <p className="text-muted small flex-grow-1">{produto.descricao}</p> */}
                                    
                                    <div className="mt-auto pt-3 border-top">
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <small className="text-muted d-block">Preço</small>
                                                <span className="text-primary fw-bold fs-3">R$ {produto.preco.toFixed(2)}</span>
                                            </div>
                                            <div className="text-end">
                                                <small className={`d-block fw-bold ${produto.quantidade > 0 ? 'text-success' : 'text-danger'}`}>{produto.quantidade > 0 ? `${produto.quantidade} disp.` : 'Esgotado'}</small>
                                                <Button variant="dark" className="mt-2 px-4" disabled={produto.quantidade <= 0} onClick={() => abrirModal(produto)}>Comprar</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* --- MODAL DE VENDA SIMPLIFICADO --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Confirmar Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {produtoSelecionado && (
                        <div className="py-3">
                            <h5 className="text-primary mb-4">{produtoSelecionado.nome}</h5>
                            
                            {/* Qtd */}
                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="fw-bold">Quantidade</Form.Label>
                                    <small className="text-muted">Max: {produtoSelecionado.quantidade}</small>
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

                            {/* Tipo de Atendimento */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Como deseja receber?</Form.Label>
                                <div className="d-grid gap-2 mb-3">
                                    <Button 
                                        variant={tipoAtendimento === 'NA_LOJA' ? 'outline-primary' : 'light'} 
                                        onClick={() => setTipoAtendimento('NA_LOJA')}
                                        className={tipoAtendimento === 'NA_LOJA' ? 'border-2 fw-bold' : 'text-muted'}
                                    >
                                        🏪 Retirar na Loja
                                    </Button>
                                    <Button 
                                        variant={tipoAtendimento === 'DOMICILIO' ? 'outline-info' : 'light'} 
                                        onClick={() => setTipoAtendimento('DOMICILIO')}
                                        className={tipoAtendimento === 'DOMICILIO' ? 'border-2 fw-bold' : 'text-muted'}
                                    >
                                        🚚 Instalação/Entrega em Domicílio
                                    </Button>
                                </div>
                                {tipoAtendimento === 'DOMICILIO' && (
                                    <small className="text-info d-block text-center bg-light p-2 rounded">
                                        ℹ️ Nossa equipe técnica entrará em contacto para agendar o horário.
                                    </small>
                                )}
                            </Form.Group>

                            <div className="bg-light p-3 rounded mt-3 d-flex justify-content-between border">
                                <span>Total a Pagar:</span>
                                <strong className="fs-5">R$ {(produtoSelecionado.preco * qtdCompra).toFixed(2)}</strong>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="link" className="text-decoration-none text-muted" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button 
                        variant="success" 
                        className="px-4 fw-bold" 
                        onClick={confirmarCompra}
                    >
                        ✅ Finalizar Pedido
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Produtos;