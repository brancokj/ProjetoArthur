import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Button, Card, Row, Col, Form, Modal, Navbar, Container, Nav, InputGroup } from 'react-bootstrap';

// --- TIPAGENS ---
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoria: string;
}

interface Venda {
  id: number;
  dataVenda: string;
  valorTotal: number;
  vendedor: string;
  tipoAtendimento: 'NA_LOJA' | 'DOMICILIO';
  usuarioNome: string;
  itens: any[];
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  admin: boolean;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'VENDAS' | 'PRODUTOS' | 'USUARIOS'>('PRODUTOS');

  // --- STATES DE DADOS ---
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // --- FILTROS DE VENDAS ---
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // --- CRUD PRODUTOS (CRIAR/EDITAR) ---
  const [showProdModal, setShowProdModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pId, setPId] = useState<number | null>(null);
  const [pNome, setPNome] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPreco, setPPreco] = useState('');
  const [pQtd, setPQtd] = useState(''); // Usado para estoque total no edit
  const [pCat, setPCat] = useState('');

  // --- NOVO: MODAL DE ADICIONAR ESTOQUE ---
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockToAdd, setStockToAdd] = useState(''); // Quantidade a adicionar
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  // Filtro Estoque Baixo
  const [mostrarSoBaixo, setMostrarSoBaixo] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const carregarTudo = async () => {
    const token = getToken();
    if (!token) return navigate('/');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const resProd = await axios.get('http://localhost:8080/api/produtos', config);
      setProdutos(Array.isArray(resProd.data) ? resProd.data : resProd.data.content || []);

      const resVendas = await axios.get('http://localhost:8080/api/vendas', config);
      setVendas(Array.isArray(resVendas.data) ? resVendas.data : resVendas.data.content || []);

      try {
        const resUsers = await axios.get('http://localhost:8080/api/usuarios', config);
        setUsuarios(resUsers.data);
      } catch (e) { console.log("Sem permissão usuários"); }
    } catch (error) { console.error("Erro ao carregar dados", error); }
  };

  // --- FUNÇÕES CRUD PRODUTO (EDITAR/CRIAR) ---
  const abrirModalProduto = (produto?: Produto) => {
    if (produto) {
      setEditMode(true); setPId(produto.id); setPNome(produto.nome); setPDesc(produto.descricao || '');
      setPPreco(produto.preco.toString()); setPQtd(produto.quantidade.toString()); setPCat(produto.categoria || '');
    } else {
      setEditMode(false); setPId(null); setPNome(''); setPDesc(''); setPPreco(''); setPQtd(''); setPCat('');
    }
    setShowProdModal(true);
  };

  const salvarProduto = async () => {
    const token = getToken();
    const payload = { nome: pNome, descricao: pDesc, preco: parseFloat(pPreco), quantidade: parseInt(pQtd), categoria: pCat };
    try {
      if (editMode && pId) {
        await axios.put(`http://localhost:8080/api/produtos/${pId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:8080/api/produtos', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowProdModal(false); carregarTudo();
    } catch (e) { alert('Erro ao salvar.'); }
  };

  const excluirProduto = async (id: number) => {
    if(!confirm("Excluir produto?")) return;
    try {
        await axios.delete(`http://localhost:8080/api/produtos/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        carregarTudo();
    } catch(e) { alert("Erro ao excluir."); }
  };

  // --- NOVA FUNÇÃO: ADICIONAR ESTOQUE (SOMA) ---
  const abrirModalEstoque = (produto: Produto) => {
    setSelectedProduct(produto);
    setStockToAdd(''); // Começa vazio
    setShowStockModal(true);
  };

  const salvarEstoque = async () => {
    if (!selectedProduct || !stockToAdd) return;
    const qtdAdicional = parseInt(stockToAdd);
    if (qtdAdicional <= 0) { alert("Digite um valor válido"); return; }

    const novaQuantidadeTotal = selectedProduct.quantidade + qtdAdicional;

    // Atualiza o produto com a nova quantidade total
    const payload = { ...selectedProduct, quantidade: novaQuantidadeTotal };
    
    try {
        await axios.put(`http://localhost:8080/api/produtos/${selectedProduct.id}`, payload, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        alert(`Estoque atualizado! Novo total: ${novaQuantidadeTotal}`);
        setShowStockModal(false);
        carregarTudo();
    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar estoque.");
    }
  };

  // --- LÓGICA DE FILTROS E EXIBIÇÃO ---
  const vendasFiltradas = vendas.filter(venda => {
    if (filtroTipo !== 'TODOS' && venda.tipoAtendimento !== filtroTipo) return false;
    if (dataInicio && venda.dataVenda.split('T')[0] < dataInicio) return false;
    if (dataFim && venda.dataVenda.split('T')[0] > dataFim) return false;
    return true;
  });

  const totalFaturado = vendasFiltradas.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
  const qtdLoja = vendasFiltradas.filter(v => v.tipoAtendimento === 'NA_LOJA').length;
  const qtdDomicilio = vendasFiltradas.filter(v => v.tipoAtendimento === 'DOMICILIO').length;

  const LIMITE_BAIXO = 10;
  const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= LIMITE_BAIXO);
  const listaProdutosExibida = mostrarSoBaixo ? produtosBaixoEstoque : produtos;

  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    switch (view) {
      case 'PRODUTOS':
        return (
          <div>
            <h3 className="fw-bold text-dark mb-4">📦 Gerenciar Estoque</h3>
            
            <Row className="mb-4 g-3">
                <Col md={4}><Card className="shadow-sm border-0 border-start border-primary border-4"><Card.Body><small>ITENS CADASTRADOS</small><h3 className="fw-bold">{produtos.length}</h3></Card.Body></Card></Col>
                <Col md={4}><Card className={`shadow-sm border-0 border-start border-4 ${produtosBaixoEstoque.length>0?'border-danger':'border-success'}`} onClick={()=>setMostrarSoBaixo(!mostrarSoBaixo)} style={{cursor:'pointer'}}><Card.Body><small className={produtosBaixoEstoque.length>0?'text-danger':'text-success'}>{produtosBaixoEstoque.length>0?'⚠️ ESTOQUE BAIXO':'✅ ESTOQUE OK'}</small><h3 className="fw-bold">{produtosBaixoEstoque.length}</h3></Card.Body></Card></Col>
                <Col md={4}><Card className="shadow-sm border-0 border-start border-success border-4"><Card.Body><small>VALOR EM ESTOQUE</small><h3 className="fw-bold text-success">R$ {produtos.reduce((acc,p)=>acc+(p.preco*p.quantidade),0).toFixed(2)}</h3></Card.Body></Card></Col>
            </Row>

            <div className="d-flex justify-content-between mb-3">
               <div>{mostrarSoBaixo && <Badge bg="danger" onClick={()=>setMostrarSoBaixo(false)} style={{cursor:'pointer'}}>Filtrando: Baixo Estoque (x)</Badge>}</div>
               <Button variant="success" onClick={() => abrirModalProduto()}>+ Novo Produto</Button>
            </div>

            <Card className="shadow-sm border-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light"><tr><th>ID</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th className="text-end">Ações</th></tr></thead>
                <tbody>
                  {listaProdutosExibida.map(p => (
                    <tr key={p.id} className={p.quantidade <= LIMITE_BAIXO ? 'table-warning' : ''}>
                      <td>#{p.id}</td>
                      <td className="fw-bold">{p.nome}</td>
                      <td><Badge bg="secondary">{p.categoria}</Badge></td>
                      <td>R$ {p.preco.toFixed(2)}</td>
                      <td>
                        <Badge bg={p.quantidade<=LIMITE_BAIXO?'danger':'success'} className="fs-6">
                            {p.quantidade} un.
                        </Badge>
                      </td>
                      <td className="text-end">
                        {/* BOTÃO ADICIONAR ESTOQUE (NOVO) */}
                        <Button size="sm" variant="success" className="me-2 fw-bold" onClick={() => abrirModalEstoque(p)} title="Adicionar quantidade">
                          📦+
                        </Button>
                        
                        {/* BOTÃO EDITAR (NORMAL) */}
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={()=>abrirModalProduto(p)} title="Editar dados">
                          ✏️
                        </Button>
                        
                        {/* BOTÃO EXCLUIR */}
                        <Button size="sm" variant="outline-danger" onClick={()=>excluirProduto(p.id)} title="Excluir">
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>
        );

      case 'VENDAS':
        return (
          <div>
            <h3 className="fw-bold text-dark mb-4">📊 Dashboard Financeiro</h3>
            <Card className="shadow-sm border-0 mb-4 bg-white">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={3}><Form.Label className="fw-bold small text-muted">Data Início</Form.Label><Form.Control type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></Col>
                        <Col md={3}><Form.Label className="fw-bold small text-muted">Data Fim</Form.Label><Form.Control type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></Col>
                        <Col md={3}><Form.Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}><option value="TODOS">Todos</option><option value="NA_LOJA">🏪 Na Loja</option><option value="DOMICILIO">🚚 Domicílio</option></Form.Select></Col>
                        <Col md={3}><Button variant="outline-secondary" className="w-100" onClick={() => {setDataInicio(''); setDataFim(''); setFiltroTipo('TODOS')}}>Limpar Filtros</Button></Col>
                    </Row>
                </Card.Body>
            </Card>
            <Row className="mb-4 g-3">
                <Col md={4}><Card className="bg-success text-white p-3 shadow-sm border-0 h-100"><div className="d-flex justify-content-between"><div><h2 className="fw-bold mb-0">R$ {totalFaturado.toFixed(2)}</h2><small>Faturamento Total</small></div><span className="fs-1 opacity-25">💲</span></div></Card></Col>
                <Col md={4}><Card className="bg-warning p-3 shadow-sm border-0 h-100"><div className="d-flex justify-content-between"><div><h2 className="fw-bold mb-0 text-dark">{qtdLoja}</h2><small className="text-dark">Vendas Loja</small></div><span className="fs-1 opacity-25">🏪</span></div></Card></Col>
                <Col md={4}><Card className="bg-info p-3 shadow-sm border-0 h-100"><div className="d-flex justify-content-between"><div><h2 className="fw-bold mb-0 text-dark">{qtdDomicilio}</h2><small className="text-dark">Vendas Domicílio</small></div><span className="fs-1 opacity-25">🚚</span></div></Card></Col>
            </Row>
            <Card className="shadow-sm border-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light text-uppercase small text-muted"><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Vendedor</th><th>Tipo</th><th>Itens</th><th className="text-end">Total</th></tr></thead>
                <tbody>
                    {vendasFiltradas.length === 0 ? (<tr><td colSpan={7} className="text-center py-4">Nenhuma venda encontrada.</td></tr>) : (
                        vendasFiltradas.map(v => (
                            <tr key={v.id}>
                                <td className="text-muted small">#{v.id}</td><td>{v.dataVenda ? new Date(v.dataVenda).toLocaleDateString() : '-'}</td>
                                <td className="fw-bold">{v.usuarioNome}</td><td>{v.vendedor || 'Online'}</td>
                                <td><Badge bg={v.tipoAtendimento === 'DOMICILIO' ? 'info' : 'warning'} text="dark">{v.tipoAtendimento}</Badge></td>
                                <td>{v.itens?.map((item, idx) => (<div key={idx} className="small">• {item.quantidade}x {item.produtoNome}</div>))}</td>
                                <td className="fw-bold text-success text-end">R$ {v.valorTotal?.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
              </Table>
            </Card>
          </div>
        );

      case 'USUARIOS':
        return (
          <div>
            <h3 className="fw-bold text-dark mb-4">👥 Gerenciar Usuários</h3>
            <Card className="shadow-sm border-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light"><tr><th>ID</th><th>Nome do Cliente</th><th>E-mail</th><th>Perfil</th></tr></thead>
                <tbody>{usuarios.map(u => (<tr key={u.id}><td>#{u.id}</td><td className="fw-bold text-primary">{u.nome || 'Não informado'}</td><td>{u.email}</td><td><Badge bg={u.admin?'dark':'secondary'}>{u.admin?'ADMIN':'CLIENTE'}</Badge></td></tr>))}</tbody>
              </Table>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
        <a href="/" className="fs-4 fw-bold text-white text-decoration-none mb-3">🛡️ Admin Pro</a><hr />
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li><button className={`nav-link w-100 text-start text-white ${view==='PRODUTOS'?'active bg-primary':''}`} onClick={()=>setView('PRODUTOS')}>📦 Estoque {produtosBaixoEstoque.length>0 && <Badge bg="danger" className="ms-2">{produtosBaixoEstoque.length}</Badge>}</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view==='VENDAS'?'active bg-primary':''}`} onClick={()=>setView('VENDAS')}>📊 Vendas</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view==='USUARIOS'?'active bg-primary':''}`} onClick={()=>setView('USUARIOS')}>👥 Usuários</button></li>
        </ul>
        <hr /><Button variant="outline-light" onClick={() => navigate('/produtos')}>Voltar para Loja</Button>
      </div>
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', height: '100vh' }}>{renderContent()}</div>

      {/* MODAL 1: CRIAR/EDITAR (COMPLETO) */}
      <Modal show={showProdModal} onHide={() => setShowProdModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editMode?'✏️ Editar Produto':'➕ Novo Produto'}</Modal.Title></Modal.Header>
        <Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control value={pNome} onChange={e=>setPNome(e.target.value)}/></Form.Group><Row><Col><Form.Group className="mb-3"><Form.Label>Preço</Form.Label><Form.Control type="number" value={pPreco} onChange={e=>setPPreco(e.target.value)}/></Form.Group></Col><Col><Form.Group className="mb-3"><Form.Label>Estoque Total</Form.Label><Form.Control type="number" value={pQtd} onChange={e=>setPQtd(e.target.value)}/></Form.Group></Col></Row><Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Control value={pCat} onChange={e=>setPCat(e.target.value)}/></Form.Group><Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" value={pDesc} onChange={e=>setPDesc(e.target.value)}/></Form.Group></Form></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowProdModal(false)}>Cancelar</Button><Button variant="primary" onClick={salvarProduto}>Salvar Alterações</Button></Modal.Footer>
      </Modal>

      {/* MODAL 2: ADICIONAR ESTOQUE (SIMPLES) */}
      <Modal show={showStockModal} onHide={() => setShowStockModal(false)} centered size="sm">
        <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="fs-5 fw-bold">📦 Entrada de Estoque</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {selectedProduct && (
                <div className="text-center">
                    <p className="mb-2">Adicionar itens para:</p>
                    <h5 className="fw-bold mb-3">{selectedProduct.nome}</h5>
                    <div className="bg-light p-2 rounded mb-3 border">
                        <small className="text-muted d-block">Estoque Atual</small>
                        <strong className="fs-4">{selectedProduct.quantidade}</strong>
                    </div>
                    <Form.Group>
                        <Form.Label className="fw-bold">Quantidade a Adicionar (+)</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="1" 
                            placeholder="Ex: 10" 
                            className="text-center fs-5 fw-bold border-success"
                            value={stockToAdd} 
                            onChange={e => setStockToAdd(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                </div>
            )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
            <Button variant="success" className="w-100 fw-bold" onClick={salvarEstoque}>CONFIRMAR ENTRADA</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default AdminDashboard;