import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Button, Card, Row, Col, Form, Modal, ListGroup } from 'react-bootstrap';

// --- TIPAGENS ATUALIZADAS ---
interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string; // Campo novo
  cpf?: string;
  cnpj?: string;
  endereco?: string;
  cep?: string;
  admin: boolean;
}

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
  usuarioNome?: string;
  usuario?: Usuario; // Objeto completo do usuário
  itens: any[];
}

interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'VENDAS' | 'PRODUTOS' | 'USUARIOS' | 'EQUIPE'>('VENDAS');

  // --- STATES DE DADOS ---
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // --- FILTROS DE VENDAS ---
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // --- CRUD PRODUTOS ---
  const [showProdModal, setShowProdModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pId, setPId] = useState<number | null>(null);
  const [pNome, setPNome] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPreco, setPPreco] = useState('');
  const [pQtd, setPQtd] = useState('');
  const [pCat, setPCat] = useState('');

  // --- CRUD EQUIPE ---
  const [showFuncModal, setShowFuncModal] = useState(false);
  const [fNome, setFNome] = useState('');

  // --- MODAIS DE VENDA (ATRIBUIÇÃO E DETALHES CLIENTE) ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [vendaParaAtribuir, setVendaParaAtribuir] = useState<Venda | null>(null);
  const [equipeSelecionada, setEquipeSelecionada] = useState<string[]>([]);

  // NOVO: Modal de Cliente
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // --- ESTOQUE RÁPIDO ---
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockToAdd, setStockToAdd] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

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
      } catch (e) { console.log("Sem permissão usuarios"); }

      try {
        const resFunc = await axios.get('http://localhost:8080/api/funcionarios', config);
        setFuncionarios(resFunc.data);
      } catch (e) { console.log("API Funcionarios off"); }

    } catch (error) { console.error("Erro geral", error); }
  };

  // --- LÓGICA DE CLIENTE ---
  const abrirDetalhesCliente = (usuario?: Usuario) => {
    if (usuario) {
      setSelectedUser(usuario);
      setShowUserModal(true);
    } else {
      alert("Dados do cliente não disponíveis para esta venda.");
    }
  };

  // --- LÓGICA DE ATRIBUIÇÃO ---
  const abrirModalAtribuicao = (venda: Venda) => {
    setVendaParaAtribuir(venda);
    if (venda.vendedor && !venda.vendedor.includes('Equipe Externa') && venda.vendedor !== 'Venda Online') {
        const nomesAtuais = venda.vendedor.split(',').map(s => s.trim());
        setEquipeSelecionada(nomesAtuais);
    } else {
        setEquipeSelecionada([]);
    }
    setShowAssignModal(true);
  };

  const toggleFuncionarioNaVenda = (nome: string) => {
      if (equipeSelecionada.includes(nome)) {
          setEquipeSelecionada(equipeSelecionada.filter(n => n !== nome));
      } else {
          setEquipeSelecionada([...equipeSelecionada, nome]);
      }
  };

  const salvarAtribuicao = async () => {
      if (!vendaParaAtribuir) return;
      const nomesFinal = equipeSelecionada.length > 0 
        ? equipeSelecionada.join(', ') 
        : 'Equipe Externa (Não especificada)';
      
      try {
          await axios.put(`http://localhost:8080/api/vendas/${vendaParaAtribuir.id}/atribuir-equipe`, 
            { equipe: nomesFinal }, 
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
          alert("Equipe atualizada!"); setShowAssignModal(false); carregarTudo();
      } catch (e) { alert("Erro ao atribuir equipe."); }
  };

  // --- CRUD GERAL ---
  const salvarFuncionario = async () => {
    try { await axios.post('http://localhost:8080/api/funcionarios', { nome: fNome }, { headers: { Authorization: `Bearer ${getToken()}` } }); alert("Salvo!"); setShowFuncModal(false); carregarTudo(); } catch (e) { alert("Erro ao salvar."); }
  }

  const salvarProduto = async () => {
    const token = getToken();
    const payload = { nome: pNome, descricao: pDesc, preco: parseFloat(pPreco), quantidade: parseInt(pQtd), categoria: pCat };
    try {
      if (editMode && pId) await axios.put(`http://localhost:8080/api/produtos/${pId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post('http://localhost:8080/api/produtos', payload, { headers: { Authorization: `Bearer ${token}` } });
      setShowProdModal(false); carregarTudo();
    } catch (e) { alert('Erro ao salvar.'); }
  };

  const excluirProduto = async (id: number) => {
    if(!confirm("Excluir?")) return;
    try { await axios.delete(`http://localhost:8080/api/produtos/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } }); carregarTudo(); } catch(e) { alert("Erro."); }
  };

  const abrirModalProduto = (p?: Produto) => {
    if (p) { setEditMode(true); setPId(p.id); setPNome(p.nome); setPDesc(p.descricao||''); setPPreco(p.preco.toString()); setPQtd(p.quantidade.toString()); setPCat(p.categoria||''); } 
    else { setEditMode(false); setPId(null); setPNome(''); setPDesc(''); setPPreco(''); setPQtd(''); setPCat(''); }
    setShowProdModal(true);
  };
  const abrirModalEstoque = (p: Produto) => { setSelectedProduct(p); setStockToAdd(''); setShowStockModal(true); };
  const salvarEstoque = async () => {
    if (!selectedProduct || !stockToAdd) return;
    try { await axios.put(`http://localhost:8080/api/produtos/${selectedProduct.id}`, { ...selectedProduct, quantidade: selectedProduct.quantidade + parseInt(stockToAdd) }, { headers: { Authorization: `Bearer ${getToken()}` } }); alert(`Atualizado!`); setShowStockModal(false); carregarTudo(); } catch (error) { alert("Erro."); }
  };

  // --- RENDER ---
  const vendasFiltradas = vendas.filter(v => {
    if (filtroTipo !== 'TODOS' && v.tipoAtendimento !== filtroTipo) return false;
    if (dataInicio && v.dataVenda.split('T')[0] < dataInicio) return false;
    if (dataFim && v.dataVenda.split('T')[0] > dataFim) return false;
    return true;
  });
  const totalFaturado = vendasFiltradas.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
  const produtosBaixo = produtos.filter(p => p.quantidade <= 10);
  const listaProdutos = mostrarSoBaixo ? produtosBaixo : produtos;

  const renderContent = () => {
    switch (view) {
      case 'PRODUTOS': return (<div><h3 className="fw-bold mb-4">📦 Estoque</h3><Row className="mb-4 g-3"><Col md={4}><Card className="shadow-sm border-start border-primary border-4"><Card.Body><small>ITENS</small><h3 className="fw-bold">{produtos.length}</h3></Card.Body></Card></Col><Col md={4}><Card className={`shadow-sm border-start border-4 ${produtosBaixo.length>0?'border-danger':'border-success'}`} onClick={()=>setMostrarSoBaixo(!mostrarSoBaixo)} style={{cursor:'pointer'}}><Card.Body><small>{produtosBaixo.length>0?'⚠️ BAIXO':'✅ OK'}</small><h3 className="fw-bold">{produtosBaixo.length}</h3></Card.Body></Card></Col><Col md={4}><Card className="shadow-sm border-start border-success border-4"><Card.Body><small>VALOR</small><h3 className="fw-bold text-success">R$ {produtos.reduce((acc,p)=>acc+(p.preco*p.quantidade),0).toFixed(2)}</h3></Card.Body></Card></Col></Row><div className="d-flex justify-content-between mb-3"><div>{mostrarSoBaixo&&<Badge bg="danger" onClick={()=>setMostrarSoBaixo(false)} style={{cursor:'pointer'}}>Filtrando Baixo (x)</Badge>}</div><Button variant="success" onClick={()=>abrirModalProduto()}>+ Novo</Button></div><Card className="shadow-sm"><Table hover responsive className="align-middle mb-0"><thead className="bg-light"><tr><th>ID</th><th>Produto</th><th>Preço</th><th>Estoque</th><th className="text-end">Ações</th></tr></thead><tbody>{listaProdutos.map(p=>(<tr key={p.id} className={p.quantidade<=10?'table-warning':''}><td>#{p.id}</td><td className="fw-bold">{p.nome}</td><td>R$ {p.preco.toFixed(2)}</td><td><Badge bg={p.quantidade<=10?'danger':'success'}>{p.quantidade}</Badge></td><td className="text-end"><Button size="sm" variant="success" className="me-2" onClick={()=>abrirModalEstoque(p)}>📦+</Button><Button size="sm" variant="outline-primary" className="me-2" onClick={()=>abrirModalProduto(p)}>✏️</Button><Button size="sm" variant="outline-danger" onClick={()=>excluirProduto(p.id)}>🗑️</Button></td></tr>))}</tbody></Table></Card></div>);
      
      case 'VENDAS': return (
          <div>
            <h3 className="fw-bold mb-4">📊 Vendas</h3>
            <Card className="mb-4 shadow-sm"><Card.Body><Row className="g-3 align-items-end"><Col md={3}><Form.Control type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)}/></Col><Col md={3}><Form.Control type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)}/></Col><Col md={3}><Form.Select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}><option value="TODOS">Todos</option><option value="NA_LOJA">🏪 Na Loja</option><option value="DOMICILIO">🚚 Domicílio</option></Form.Select></Col><Col md={3}><Button variant="outline-secondary" className="w-100" onClick={()=>{setDataInicio('');setDataFim('');setFiltroTipo('TODOS')}}>Limpar</Button></Col></Row></Card.Body></Card>
            <Card className="shadow-sm">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light text-uppercase small text-muted"><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Equipe</th><th>Tipo</th><th>Itens</th><th className="text-end">Total</th></tr></thead>
                <tbody>
                    {vendasFiltradas.map(v => {
                        const vendedorStr = v.vendedor || '';
                        const isPendente = vendedorStr.includes('Equipe Externa') || vendedorStr === '';
                        const isDomicilio = v.tipoAtendimento === 'DOMICILIO';
                        const nomeCliente = v.usuarioNome || v.usuario?.nome || 'Anônimo';

                        return (
                            <tr key={v.id}>
                                <td className="text-muted small">#{v.id}</td>
                                <td>{v.dataVenda ? new Date(v.dataVenda).toLocaleDateString() : '-'}</td>
                                
                                {/* --- NOME CLICÁVEL --- */}
                                <td>
                                    {v.usuario ? (
                                        <span 
                                            className="fw-bold text-primary text-decoration-underline" 
                                            style={{cursor: 'pointer'}}
                                            onClick={() => abrirDetalhesCliente(v.usuario)}
                                            title="Clique para ver detalhes do cliente"
                                        >
                                            {nomeCliente}
                                        </span>
                                    ) : (
                                        <span className="text-muted fst-italic">{nomeCliente}</span>
                                    )}
                                </td>

                                <td>
                                    {isDomicilio ? (
                                        <div className="d-flex align-items-center gap-2">
                                            {!isPendente ? <Badge bg="primary" style={{maxWidth:'150px'}} className="text-truncate">{v.vendedor}</Badge> : <Badge bg="danger">Pendente</Badge>}
                                            <Button size="sm" variant="outline-secondary" style={{fontSize: '0.7rem'}} onClick={() => abrirModalAtribuicao(v)}>✏️</Button>
                                        </div>
                                    ) : <span className="text-muted small">Balcão</span>}
                                </td>
                                <td><Badge bg={isDomicilio?'info':'warning'} text="dark">{v.tipoAtendimento}</Badge></td>
                                <td>{v.itens?.map((item, i) => (<div key={i} className="small">• {item.quantidade}x {item.produtoNome}</div>))}</td>
                                <td className="fw-bold text-success text-end">R$ {v.valorTotal?.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
              </Table>
            </Card>
          </div>
      );
      case 'USUARIOS': return (<div><h3 className="fw-bold mb-4">👥 Usuários</h3><Card><Table hover><thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Perfil</th></tr></thead><tbody>{usuarios.map(u=>(<tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{u.telefone || '-'}</td><td><Badge bg={u.admin?'dark':'secondary'}>{u.admin?'ADMIN':'CLIENTE'}</Badge></td></tr>))}</tbody></Table></Card></div>);
      case 'EQUIPE': return (<div><div className="d-flex justify-content-between mb-4"><h3 className="fw-bold">👷 Equipe</h3><Button onClick={() => { setFNome(''); setShowFuncModal(true); }}>+ Novo</Button></div><Row>{funcionarios.map(f=>(<Col md={4} key={f.id} className="mb-3"><Card className="h-100 shadow-sm"><Card.Body className="d-flex align-items-center gap-3"><div className="bg-light rounded-circle p-3 fs-3">👷</div><div><h5 className="fw-bold mb-0">{f.nome}</h5></div></Card.Body></Card></Col>))}</Row></div>);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
        <a href="/" className="fs-4 fw-bold text-white text-decoration-none mb-3">🛡️ Admin Pro</a><hr />
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li><button className={`nav-link w-100 text-start text-white ${view==='PRODUTOS'?'active bg-primary':''}`} onClick={()=>setView('PRODUTOS')}>📦 Estoque</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view==='VENDAS'?'active bg-primary':''}`} onClick={()=>setView('VENDAS')}>📊 Vendas</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view==='USUARIOS'?'active bg-primary':''}`} onClick={()=>setView('USUARIOS')}>👥 Usuários</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view==='EQUIPE'?'active bg-primary':''}`} onClick={()=>setView('EQUIPE')}>👷 Equipe</button></li>
        </ul>
        <hr /><Button variant="outline-light" onClick={() => navigate('/produtos')}>Sair</Button>
      </div>
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', height: '100vh' }}>{renderContent()}</div>

      {/* --- MODAIS EXISTENTES (PRODUTO, ESTOQUE, FUNCIONARIO, ATRIBUIÇÃO) --- */}
      <Modal show={showProdModal} onHide={()=>setShowProdModal(false)} centered><Modal.Header closeButton><Modal.Title>{editMode?'Editar':'Novo'}</Modal.Title></Modal.Header><Modal.Body><Form><Form.Control placeholder="Nome" value={pNome} onChange={e=>setPNome(e.target.value)} className="mb-3"/><Row><Col><Form.Control type="number" placeholder="Preço" value={pPreco} onChange={e=>setPPreco(e.target.value)} className="mb-3"/></Col><Col><Form.Control type="number" placeholder="Qtd" value={pQtd} onChange={e=>setPQtd(e.target.value)} className="mb-3"/></Col></Row><Form.Control placeholder="Categoria" value={pCat} onChange={e=>setPCat(e.target.value)} className="mb-3"/><Form.Control as="textarea" placeholder="Descrição" value={pDesc} onChange={e=>setPDesc(e.target.value)}/></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowProdModal(false)}>Cancelar</Button><Button variant="primary" onClick={salvarProduto}>Salvar</Button></Modal.Footer></Modal>
      <Modal show={showStockModal} onHide={()=>setShowStockModal(false)} centered size="sm"><Modal.Header closeButton className="bg-success text-white"><Modal.Title>📦 Entrada</Modal.Title></Modal.Header><Modal.Body>{selectedProduct&&(<div className="text-center"><h5 className="fw-bold mb-3">{selectedProduct.nome}</h5><div className="bg-light p-2 rounded mb-3 border"><small>Atual</small><strong className="fs-4 d-block">{selectedProduct.quantidade}</strong></div><Form.Control type="number" min="1" placeholder="+ Qtd" className="text-center fs-5 fw-bold border-success" value={stockToAdd} onChange={e=>setStockToAdd(e.target.value)} autoFocus /></div>)}</Modal.Body><Modal.Footer><Button variant="success" className="w-100 fw-bold" onClick={salvarEstoque}>CONFIRMAR</Button></Modal.Footer></Modal>
      <Modal show={showFuncModal} onHide={()=>setShowFuncModal(false)} centered><Modal.Header closeButton><Modal.Title>👷 Novo Funcionário</Modal.Title></Modal.Header><Modal.Body><Form.Control placeholder="Nome Completo" value={fNome} onChange={e=>setFNome(e.target.value)}/></Modal.Body><Modal.Footer><Button onClick={()=>setShowFuncModal(false)}>Cancelar</Button><Button variant="primary" onClick={salvarFuncionario}>Salvar</Button></Modal.Footer></Modal>
      
      <Modal show={showAssignModal} onHide={()=>setShowAssignModal(false)} centered>
        <Modal.Header closeButton className="bg-info text-dark"><Modal.Title className="fw-bold">👨‍🔧 Designar Equipe</Modal.Title></Modal.Header>
        <Modal.Body>
            <p className="text-muted">Selecione os técnicos para a Venda <strong>#{vendaParaAtribuir?.id}</strong>:</p>
            <Card className="border-0 shadow-sm bg-light"><ListGroup variant="flush">{funcionarios.length===0?<div className="p-3 text-center">Sem funcionários.</div>:funcionarios.map(f=>(<ListGroup.Item key={f.id} className="d-flex gap-3 align-items-center bg-transparent"><Form.Check type="checkbox" id={`assign-${f.id}`} checked={equipeSelecionada.includes(f.nome)} onChange={()=>toggleFuncionarioNaVenda(f.nome)} style={{transform:'scale(1.2)'}}/><label htmlFor={`assign-${f.id}`} style={{cursor:'pointer',flexGrow:1,fontWeight:'500'}}>{f.nome}</label></ListGroup.Item>))}</ListGroup></Card>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowAssignModal(false)}>Cancelar</Button><Button variant="primary" onClick={salvarAtribuicao}>💾 Salvar</Button></Modal.Footer>
      </Modal>

      {/* --- NOVO: MODAL DE DETALHES DO CLIENTE --- */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">👤 Detalhes do Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <div className="d-flex flex-column gap-3">
              <div className="text-center mb-3">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center border border-3 border-white shadow-sm" style={{ width: '80px', height: '80px' }}>
                  <span className="fs-1">👤</span>
                </div>
                <h4 className="fw-bold mt-2">{selectedUser.nome}</h4>
                <Badge bg={selectedUser.admin ? 'dark' : 'secondary'}>{selectedUser.admin ? 'ADMINISTRADOR' : 'CLIENTE'}</Badge>
              </div>
              
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body>
                  <Row className="g-3">
                    <Col xs={12}>
                        <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Email</small>
                        <span className="fs-6">{selectedUser.email}</span>
                    </Col>
                    <Col xs={6}>
                        <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Telefone</small>
                        <span className="fs-5 fw-bold text-dark">{selectedUser.telefone || '-'}</span>
                    </Col>
                    <Col xs={6}>
                        <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>CPF/CNPJ</small>
                        <span>{selectedUser.cpf || selectedUser.cnpj || '-'}</span>
                    </Col>
                    <Col xs={12}>
                        <hr className="my-2"/>
                        <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Endereço de Entrega</small>
                        <div>{selectedUser.endereco || 'Endereço não cadastrado'}</div>
                        <small className="text-muted">CEP: {selectedUser.cep || '-'}</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted">Carregando...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default AdminDashboard;