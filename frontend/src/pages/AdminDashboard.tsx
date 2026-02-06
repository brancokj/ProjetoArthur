import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Tab, Nav, Button, Alert, Navbar, Form, Modal, InputGroup } from 'react-bootstrap';

// Tipos de dados
interface Produto { id: number; nome: string; quantidade: number; preco: number; categoria: string; }
interface Usuario { id: number; email: string; admin: boolean; cpf?: string; cnpj?: string; }
interface Venda { 
    id: number; 
    dataVenda: string; 
    valorTotal: number; 
    usuario: { email: string }; 
    itens: { produto: { nome: string }, quantidade: number }[]; 
}

// Categorias para o seletor
const CATEGORIAS = ["Eletrônicos", "Periféricos", "Games", "Escritório", "Hardware", "Outros"];

function AdminDashboard() {
    // --- ESTADOS GERAIS ---
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [vendas, setVendas] = useState<Venda[]>([]);
    
    // Filtros de Data
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    
    const navigate = useNavigate();

    // --- ESTADOS DO MODAL DE ESTOQUE (Reposição Rápida) ---
    const [showModalEstoque, setShowModalEstoque] = useState(false);
    const [produtoEstoque, setProdutoEstoque] = useState<Produto | null>(null);
    const [qtdAdicionar, setQtdAdicionar] = useState(0);

    // --- ESTADOS DO MODAL DE PRODUTO (Criar/Editar) ---
    const [showModalForm, setShowModalForm] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false); // false = Criar, true = Editar
    const [idEdicao, setIdEdicao] = useState<number | null>(null);
    
    // Campos do Formulário
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState(0);
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [qtdInicial, setQtdInicial] = useState(0); // Só usa ao criar novo

    // Carrega dados ao abrir a tela
    useEffect(() => { carregarDados(false); }, []);

    // Função principal de buscar dados
    const carregarDados = async (usarFiltro: boolean) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        try {
            let urlVendas = 'http://localhost:8080/api/vendas/todas';
            if (usarFiltro && dataInicio && dataFim) {
                urlVendas += `?inicio=${dataInicio}&fim=${dataFim}`;
            }
            
            const [resProd, resUser, resVendas] = await Promise.all([
                axios.get('http://localhost:8080/api/produtos', config),
                axios.get('http://localhost:8080/api/usuarios', config),
                axios.get(urlVendas, config)
            ]);

            // Garante que são arrays antes de salvar no estado
            setProdutos(Array.isArray(resProd.data.content || resProd.data) ? (resProd.data.content || resProd.data) : []);
            setUsuarios(Array.isArray(resUser.data) ? resUser.data : []);
            setVendas(Array.isArray(resVendas.data.content || resVendas.data) ? (resVendas.data.content || resVendas.data) : []);
        } catch (error) { console.error("Erro:", error); }
    };

    // --- AÇÕES DE ESTOQUE ---
    const abrirModalEstoque = (p: Produto) => {
        setProdutoEstoque(p);
        setQtdAdicionar(0);
        setShowModalEstoque(true);
    };

    const confirmarEstoque = async () => {
        if (!produtoEstoque || qtdAdicionar <= 0) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/produtos/${produtoEstoque.id}/estoque`, { quantidade: qtdAdicionar }, { headers: { 'Authorization': `Bearer ${token}` } });
            alert("✅ Estoque atualizado!");
            setShowModalEstoque(false);
            carregarDados(false);
        } catch (e) { alert("Erro ao repor estoque."); }
    };

    // --- AÇÕES DE CRUD (PRODUTOS) ---
    const abrirModalCriar = () => {
        setModoEdicao(false);
        setNome('');
        setPreco(0);
        setCategoria(CATEGORIAS[0]);
        setQtdInicial(0);
        setShowModalForm(true);
    };

    const abrirModalEditar = (p: Produto) => {
        setModoEdicao(true);
        setIdEdicao(p.id);
        setNome(p.nome);
        setPreco(p.preco);
        setCategoria(p.categoria || CATEGORIAS[0]);
        setShowModalForm(true);
    };

    const salvarProduto = async () => {
        const token = localStorage.getItem('token');
        const payload = { nome, preco, categoria, quantidade: qtdInicial };
        
        try {
            if (modoEdicao && idEdicao) {
                // EDITAR
                await axios.put(`http://localhost:8080/api/produtos/${idEdicao}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
                alert("✅ Produto atualizado com sucesso!");
            } else {
                // CRIAR
                await axios.post(`http://localhost:8080/api/produtos`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
                alert("✅ Produto cadastrado com sucesso!");
            }
            setShowModalForm(false);
            carregarDados(false);
        } catch (e) { alert("Erro ao salvar produto."); }
    };

    // Cálculos de Resumo
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade < 10);
    const faturamentoTotal = vendas.reduce((acc, venda) => acc + venda.valorTotal, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#e9ecef' }}>
            {/* --- NAVBAR SUPERIOR --- */}
            <Navbar bg="dark" variant="dark" className="mb-4 shadow py-3">
                <Container>
                    <Navbar.Brand className="fw-bold fs-4">🛡️ Painel Administrativo</Navbar.Brand>
                    <Nav className="ms-auto">
                        <Button variant="outline-light" onClick={() => navigate('/produtos')}>
                            ⬅ Voltar para Loja
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container>
                {/* --- CARDS DE RESUMO (TOPO) --- */}
                <Row className="mb-4 g-3">
                    <Col md={4}>
                        <Card className="text-white bg-primary h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <h6 className="opacity-75">FATURAMENTO TOTAL</h6>
                                <h2 className="fw-bold display-6">R$ {faturamentoTotal.toFixed(2)}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="text-white bg-success h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <h6 className="opacity-75">TOTAL DE VENDAS</h6>
                                <h2 className="fw-bold display-6">{vendas.length}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={`text-white h-100 shadow-sm border-0 ${produtosBaixoEstoque.length > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                            <Card.Body className="text-center">
                                <h6 className="opacity-75">ALERTA DE ESTOQUE</h6>
                                <h2 className="fw-bold display-6">{produtosBaixoEstoque.length} itens</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- CONTEÚDO PRINCIPAL (ABAS) --- */}
                <Tab.Container defaultActiveKey="estoque">
                    <Card className="shadow-lg border-0 rounded-3 overflow-hidden">
                        
                        {/* CABEÇALHO DAS ABAS (ORELHAS AMARELAS) */}
                        <Card.Header className="bg-white border-bottom pt-3 pb-0 ps-4">
                            <Nav variant="tabs" className="mb-0 border-0 custom-tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="estoque">📦 Gerenciar Estoque</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="vendas">💰 Vendas</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="alertas">🚨 Estoque Crítico</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="usuarios">👥 Usuários</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>

                        <Card.Body className="p-4 bg-white">
                            <Tab.Content>
                                
                                {/* ABA 1: GERENCIAR ESTOQUE (CRUD) */}
                                <Tab.Pane eventKey="estoque">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="text-muted mb-0">Catálogo de Produtos</h5>
                                        <Button variant="success" className="fw-bold shadow-sm" onClick={abrirModalCriar}>
                                            ✨ Novo Produto
                                        </Button>
                                    </div>
                                    <Table hover striped className="align-middle table-bordered">
                                        <thead className="table-secondary">
                                            <tr>
                                                <th>ID</th>
                                                <th>Produto</th>
                                                <th>Categoria</th>
                                                <th>Preço</th>
                                                <th className="text-center">Qtd</th>
                                                <th className="text-end" style={{minWidth: '200px'}}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {produtos.map(p => (
                                                <tr key={p.id}>
                                                    <td className="text-muted">#{p.id}</td>
                                                    <td className="fw-bold">{p.nome}</td>
                                                    <td><Badge bg="light" text="dark" className="border">{p.categoria || 'Geral'}</Badge></td>
                                                    <td>R$ {p.preco.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <Badge bg={p.quantidade < 10 ? 'danger' : 'success'} pill>{p.quantidade}</Badge>
                                                    </td>
                                                    <td className="text-end">
                                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => abrirModalEditar(p)}>✏️ Editar</Button>
                                                        <Button variant="outline-dark" size="sm" onClick={() => abrirModalEstoque(p)}>➕ Repor</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>

                                {/* ABA 2: VENDAS (COM FILTRO) */}
                                <Tab.Pane eventKey="vendas">
                                    <div className="bg-light p-3 rounded-3 mb-4 border d-flex gap-3 align-items-end">
                                        <div className="flex-grow-1">
                                            <label className="small fw-bold text-muted">Data Inicial</label>
                                            <Form.Control type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <label className="small fw-bold text-muted">Data Final</label>
                                            <Form.Control type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                                        </div>
                                        <div>
                                            <Button onClick={() => carregarDados(true)} className="me-2">Filtrar</Button>
                                            <Button variant="outline-secondary" onClick={() => { setDataInicio(''); setDataFim(''); carregarDados(false); }}>Limpar</Button>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <Table hover striped className="align-middle table-bordered">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th># ID</th>
                                                    <th>Data</th>
                                                    <th>Cliente</th>
                                                    <th>Itens</th>
                                                    <th className="text-end">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendas.length === 0 ? (
                                                    <tr><td colSpan={5} className="text-center py-4 text-muted">Nenhuma venda encontrada.</td></tr>
                                                ) : (
                                                    vendas.map(v => (
                                                        <tr key={v.id}>
                                                            <td>#{v.id}</td>
                                                            <td>{new Date(v.dataVenda).toLocaleString()}</td>
                                                            <td>{v.usuario?.email}</td>
                                                            <td>{v.itens.map((i, idx) => <Badge key={idx} bg="light" text="dark" className="me-1 border">{i.quantidade}x {i.produto.nome}</Badge>)}</td>
                                                            <td className="text-end fw-bold text-success">R$ {v.valorTotal.toFixed(2)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Tab.Pane>

                                {/* ABA 3: ALERTAS DE ESTOQUE */}
                                <Tab.Pane eventKey="alertas">
                                    {produtosBaixoEstoque.length === 0 ? (
                                        <Alert variant="success">✅ Tudo certo! Estoque saudável.</Alert>
                                    ) : (
                                        <Table hover striped className="border-danger align-middle">
                                            <thead className="bg-danger text-white">
                                                <tr>
                                                    <th>Produto Crítico</th>
                                                    <th className="text-center">Qtd Atual</th>
                                                    <th className="text-end">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {produtosBaixoEstoque.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="fw-bold">{p.nome}</td>
                                                        <td className="fw-bold text-danger text-center fs-5">{p.quantidade}</td>
                                                        <td className="text-end">
                                                            <Button size="sm" variant="outline-danger" onClick={() => abrirModalEstoque(p)}>➕ REPOR AGORA</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Tab.Pane>

                                {/* ABA 4: USUÁRIOS (ESTILIZADA COM CORES) */}
                                <Tab.Pane eventKey="usuarios">
                                    <Table hover striped className="align-middle table-bordered">
                                        <thead className="table-primary">
                                            <tr>
                                                <th className="py-3">ID</th>
                                                <th className="py-3">E-mail de Acesso</th>
                                                <th className="py-3">Documento (CPF/CNPJ)</th>
                                                <th className="py-3 text-center">Nível de Acesso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.map(u => (
                                                <tr key={u.id}>
                                                    <td className="text-muted">#{u.id}</td>
                                                    <td className="fw-bold">{u.email}</td>
                                                    <td>{u.cpf || u.cnpj || <span className="text-muted font-italic">- não informado -</span>}</td>
                                                    <td className="text-center">
                                                        {u.admin ? (
                                                            <Badge bg="danger" className="px-3 py-2 shadow-sm">
                                                                🛡️ ADMINISTRADOR
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="primary" className="px-3 py-2 shadow-sm">
                                                                👤 CLIENTE
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>

                            </Tab.Content>
                        </Card.Body>
                    </Card>
                </Tab.Container>
            </Container>

            {/* --- MODAL 1: REPOR ESTOQUE (RÁPIDO) --- */}
            <Modal show={showModalEstoque} onHide={() => setShowModalEstoque(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Repor Estoque</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {produtoEstoque && (
                        <>
                            <h5 className="text-center mb-3">{produtoEstoque.nome}</h5>
                            <Form.Group>
                                <Form.Label>Quantidade a adicionar (+):</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    autoFocus 
                                    min="1" 
                                    value={qtdAdicionar} 
                                    onChange={e => setQtdAdicionar(parseInt(e.target.value))} 
                                />
                                <Form.Text className="text-muted">
                                    Atual: {produtoEstoque.quantidade} ➝ Ficará: {produtoEstoque.quantidade + (qtdAdicionar || 0)}
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" className="w-100" onClick={confirmarEstoque}>Confirmar Entrada</Button>
                </Modal.Footer>
            </Modal>

            {/* --- MODAL 2: CRIAR / EDITAR PRODUTO (COMPLETO) --- */}
            <Modal show={showModalForm} onHide={() => setShowModalForm(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>{modoEdicao ? '✏️ Editar Produto' : '✨ Novo Produto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome do Produto</Form.Label>
                            <Form.Control type="text" placeholder="Ex: Cadeira Gamer" value={nome} onChange={e => setNome(e.target.value)} />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select value={categoria} onChange={e => setCategoria(e.target.value)}>
                                        {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Preço (R$)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>R$</InputGroup.Text>
                                        <Form.Control type="number" step="0.01" value={preco} onChange={e => setPreco(parseFloat(e.target.value))} />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        {!modoEdicao && (
                            <Form.Group className="mb-3 bg-light p-3 rounded border">
                                <Form.Label className="fw-bold">Estoque Inicial</Form.Label>
                                <Form.Control type="number" value={qtdInicial} onChange={e => setQtdInicial(parseInt(e.target.value))} />
                                <Form.Text className="text-muted">Começar com quantas unidades?</Form.Text>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalForm(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={salvarProduto}>{modoEdicao ? 'Salvar Alterações' : 'Cadastrar Produto'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminDashboard;