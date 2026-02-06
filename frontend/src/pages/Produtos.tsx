import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Card, Button, Row, Col, Badge, Modal, Form, InputGroup, Accordion, ListGroup } from 'react-bootstrap';

interface Produto {
    id: number;
    nome: string;
    preco: number;
    quantidade: number;
    categoria: string;
}

interface Funcionario {
    id: number;
    nome: string;
}

function Produtos() {
    // --- 1. HOOKS ---
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]); // Lista de funcionarios do banco
    const [busca, setBusca] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Estados do Modal de Compra
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [qtdCompra, setQtdCompra] = useState(1);

    // Estados da Venda (Tipo e Equipe)
    const [tipoAtendimento, setTipoAtendimento] = useState('NA_LOJA'); 
    const [equipeSelecionada, setEquipeSelecionada] = useState<string[]>([]); // Array com nomes dos selecionados

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

        // 2. Busca Usuário (Admin)
        axios.get('http://localhost:8080/api/usuarios/me', { headers })
        .then(res => setIsAdmin(res.data.admin))
        .catch(err => console.error(err));

        // 3. Busca Funcionários (Para o Acordeão)
        axios.get('http://localhost:8080/api/funcionarios', { headers })
        .then(res => setFuncionarios(res.data))
        .catch(() => console.log("Erro ao carregar equipe ou endpoint inexistente"));
    };

    // --- 3. LÓGICA DE SELEÇÃO DE EQUIPE ---
    const toggleFuncionario = (nome: string) => {
        if (equipeSelecionada.includes(nome)) {
            // Se já está, remove
            setEquipeSelecionada(equipeSelecionada.filter(n => n !== nome));
        } else {
            // Se não está, adiciona
            setEquipeSelecionada([...equipeSelecionada, nome]);
        }
    };

    const abrirModal = (p: Produto) => {
        setProdutoSelecionado(p);
        setQtdCompra(1);
        setTipoAtendimento('NA_LOJA'); // Reseta para padrão
        setEquipeSelecionada([]); // Limpa equipe
        setShowModal(true);
    };

    const confirmarCompra = async () => {
        if (!produtoSelecionado) return;
        try {
            const token = localStorage.getItem('token');
            
            // Define o nome do vendedor/equipe
            let vendedorFinal = '';
            
            if (tipoAtendimento === 'DOMICILIO') {
                // Junta os nomes marcados: "João, Maria, Pedro"
                vendedorFinal = equipeSelecionada.length > 0 
                    ? equipeSelecionada.join(', ') 
                    : 'Equipe Externa (Não especificada)';
            } else {
                vendedorFinal = 'Venda Balcão';
            }

            const vendaPayload = {
                vendedor: vendedorFinal,
                tipoAtendimento: tipoAtendimento,
                itens: [
                    { idProduto: produtoSelecionado.id, quantidade: qtdCompra }
                ]
            };

            await axios.post('http://localhost:8080/api/vendas/finalizar', vendaPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert(`✅ Venda realizada!\nAtendimento: ${tipoAtendimento}\nResponsável: ${vendedorFinal}`);
            carregarDados(); 
            setShowModal(false);
        } catch (error) {
            console.error(error); 
            alert("❌ Erro ao realizar venda.");
        }
    };

    // --- 4. VISUAL ---
    const produtosFiltrados = produtos.filter(p => 
        p.nome?.toLowerCase().includes(busca.toLowerCase()) || 
        p.categoria?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="fw-bold">📦 Estoque Pro</Navbar.Brand>
                    <Nav className="ms-auto">
                        {isAdmin && (
                            <Button variant="warning" size="sm" className="me-2 fw-bold" onClick={() => navigate('/admin')}>
                                🛡️ Área Admin
                            </Button>
                        )}
                        <Button variant="outline-light" size="sm" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>Sair</Button>
                    </Nav>
                </Container>
            </Navbar>

            {/* HERO */}
            <div className="bg-primary text-white py-5 mb-5 shadow">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 className="fw-bold">Catálogo de Produtos</h1>
                            <p className="lead">Selecione os itens para venda ou instalação.</p>
                        </Col>
                        <Col md={6}>
                            <InputGroup size="lg">
                                <Form.Control placeholder="🔍 Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ borderRadius: '30px 0 0 30px', border: 'none' }} />
                                <Button variant="light" style={{ borderRadius: '0 30px 30px 0' }}>Buscar</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* LISTA */}
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
                                    <div className="mt-auto pt-3 border-top">
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <small className="text-muted d-block">Preço</small>
                                                <span className="text-primary fw-bold fs-3">R$ {produto.preco.toFixed(2)}</span>
                                            </div>
                                            <div className="text-end">
                                                <small className={`d-block fw-bold ${produto.quantidade > 0 ? 'text-success' : 'text-danger'}`}>{produto.quantidade > 0 ? `${produto.quantidade} disp.` : 'Esgotado'}</small>
                                                <Button variant="dark" className="mt-2 px-4" disabled={produto.quantidade <= 0} onClick={() => abrirModal(produto)}>Vender</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* --- MODAL DE VENDA COM ACORDEÃO --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Nova Venda</Modal.Title>
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
                                <Form.Control type="number" min="1" max={produtoSelecionado.quantidade} value={qtdCompra} onChange={(e) => setQtdCompra(parseInt(e.target.value))} size="lg" />
                            </Form.Group>

                            {/* Tipo de Atendimento */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Tipo de Serviço:</Form.Label>
                                <div className="d-flex gap-3 mb-3">
                                    <Button 
                                        variant={tipoAtendimento === 'NA_LOJA' ? 'primary' : 'outline-secondary'} 
                                        onClick={() => setTipoAtendimento('NA_LOJA')}
                                        className="flex-fill"
                                    >
                                        🏪 Na Loja
                                    </Button>
                                    <Button 
                                        variant={tipoAtendimento === 'DOMICILIO' ? 'info' : 'outline-secondary'} 
                                        onClick={() => setTipoAtendimento('DOMICILIO')}
                                        className="flex-fill"
                                    >
                                        🚚 Domicílio
                                    </Button>
                                </div>
                            </Form.Group>

                            {/* --- ACORDEÃO PARA SELECIONAR EQUIPE (Só aparece se for Domicílio) --- */}
                            {tipoAtendimento === 'DOMICILIO' && (
                                <Accordion defaultActiveKey="0" className="mb-3">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>👷 Designar Colaboradores (Obrigatório)</Accordion.Header>
                                        <Accordion.Body className="p-0">
                                            {funcionarios.length === 0 ? (
                                                <div className="p-3 text-muted text-center small">
                                                    Nenhum funcionário cadastrado no Admin.
                                                </div>
                                            ) : (
                                                <ListGroup variant="flush">
                                                    {funcionarios.map(func => (
                                                        <ListGroup.Item key={func.id} className="d-flex gap-3 align-items-center">
                                                            <Form.Check 
                                                                type="checkbox"
                                                                id={`func-${func.id}`}
                                                                checked={equipeSelecionada.includes(func.nome)}
                                                                onChange={() => toggleFuncionario(func.nome)}
                                                            />
                                                            <label htmlFor={`func-${func.id}`} style={{cursor: 'pointer', flexGrow: 1}}>
                                                                {func.nome}
                                                            </label>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            
                            {/* Resumo */}
                            {tipoAtendimento === 'DOMICILIO' && equipeSelecionada.length > 0 && (
                                <div className="alert alert-info py-2 small">
                                    <strong>Equipe:</strong> {equipeSelecionada.join(', ')}
                                </div>
                            )}

                            <div className="bg-light p-3 rounded mt-3 d-flex justify-content-between border">
                                <span>Total:</span>
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
                        // Desabilita se for domicilio mas não tiver selecionado ninguém
                        disabled={tipoAtendimento === 'DOMICILIO' && equipeSelecionada.length === 0}
                    >
                        ✅ Finalizar Venda
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Produtos;