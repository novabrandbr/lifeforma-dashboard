import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('PENDENTE');
  const [expandido, setExpandido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarPedidos();
    const intervalo = setInterval(carregarPedidos, 60000); // Atualiza a cada 1 min
    return () => clearInterval(intervalo);
  }, []);

  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const response = await fetch('/api/pedidos');
      if (!response.ok) throw new Error('Erro ao carregar dados');
      const data = await response.json();
      setPedidos(data);
      setErro(null);
    } catch (err) {
      console.error('Erro:', err);
      setErro('Erro ao carregar pedidos. Verifique a conexão com Google Sheets.');
      // Dados de exemplo
      setPedidos([
        {
          id: 1,
          nome: 'Maria Silva',
          produto: 'Colágeno Hidrolisado 300g',
          data: '15/07/2026',
          comprovante: '#',
          status: 'PENDENTE'
        }
      ]);
    } finally {
      setCarregando(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        setPedidos(pedidos.map(p =>
          p.id === id ? { ...p, status: novoStatus } : p
        ));
      }
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      alert('Erro ao atualizar status');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => p.status === filtro || filtro === 'TODOS');
  const contadores = {
    PENDENTE: pedidos.filter(p => p.status === 'PENDENTE').length,
    'EM ANDAMENTO': pedidos.filter(p => p.status === 'EM ANDAMENTO').length,
    FINALIZADO: pedidos.filter(p => p.status === 'FINALIZADO').length
  };

  return (
    <>
      <Head>
        <title>Dashboard Lifeforma - Pedidos Atrasados</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #1e293b;
          min-height: 100vh;
          padding: 20px;
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>🚨 PEDIDOS ATRASADOS</h1>
            <p style={styles.subtitle}>Sistema de Controle - Lifeforma</p>
          </div>
          <div style={styles.counter}>{pedidos.length} pedidos</div>
        </header>

        {/* Estatísticas */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeftColor: '#ef4444' }}>
            <div style={styles.statValue}>{contadores.PENDENTE}</div>
            <div style={styles.statLabel}>🔴 Pendente</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#f59e0b' }}>
            <div style={styles.statValue}>{contadores['EM ANDAMENTO']}</div>
            <div style={styles.statLabel}>🟡 Em Andamento</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#10b981' }}>
            <div style={styles.statValue}>{contadores.FINALIZADO}</div>
            <div style={styles.statLabel}>🟢 Finalizado</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filtros}>
          {['PENDENTE', 'EM ANDAMENTO', 'FINALIZADO', 'TODOS'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filtro === f ? '#ef4444' : 'white',
                color: filtro === f ? 'white' : '#1e293b',
                borderColor: filtro === f ? '#ef4444' : '#e2e8f0'
              }}
            >
              {f === 'PENDENTE' && '🔴'} {f === 'EM ANDAMENTO' && '🟡'} {f === 'FINALIZADO' && '🟢'} {f}
            </button>
          ))}
        </div>

        {/* Aviso/Erro */}
        {erro && <div style={styles.aviso}>{erro}</div>}

        {/* Pedidos */}
        <div style={styles.pedidosContainer}>
          {carregando ? (
            <div style={styles.loading}>Carregando pedidos...</div>
          ) : pedidosFiltrados.length === 0 ? (
            <div style={styles.vazio}>Nenhum pedido encontrado</div>
          ) : (
            pedidosFiltrados.map(pedido => (
              <div
                key={pedido.id}
                style={{
                  ...styles.pedidoCard,
                  borderTopColor:
                    pedido.status === 'PENDENTE' ? '#ef4444' :
                    pedido.status === 'EM ANDAMENTO' ? '#f59e0b' : '#10b981'
                }}
              >
                <div
                  onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                  style={styles.pedidoHeader}
                >
                  <div style={styles.pedidoInfo}>
                    <div style={styles.pedidoData}>{pedido.data}</div>
                    <div style={styles.pedidoNome}>{pedido.nome}</div>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: pedido.status === 'PENDENTE' ? '#fee2e2' :
                                       pedido.status === 'EM ANDAMENTO' ? '#fef3c7' : '#d1fae5',
                      color: pedido.status === 'PENDENTE' ? '#991b1b' :
                             pedido.status === 'EM ANDAMENTO' ? '#92400e' : '#065f46'
                    }}>
                      {pedido.status}
                    </span>
                  </div>
                  <div style={styles.arrow}>
                    {expandido === pedido.id ? '▲' : '▼'}
                  </div>
                </div>

                {/* Conteúdo Expandido */}
                {expandido === pedido.id && (
                  <div style={styles.pedidoDetalhes}>
                    <div style={styles.detalhe}>
                      <div style={styles.detalheLabel}>📦 PRODUTO</div>
                      <div style={styles.detalheValor}>{pedido.produto}</div>
                    </div>

                    <div style={styles.detalhe}>
                      <div style={styles.detalheLabel}>📅 DATA DA COMPRA</div>
                      <div style={styles.detalheValor}>{pedido.data}</div>
                    </div>

                    <div style={styles.detalhe}>
                      <div style={styles.detalheLabel}>💳 COMPROVANTE</div>
                      {pedido.comprovante && pedido.comprovante !== '#' ? (
                        <a href={pedido.comprovante} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          Ver Comprovante 📄
                        </a>
                      ) : (
                        <div style={styles.semDado}>Sem comprovante</div>
                      )}
                    </div>

                    {/* Botões de Status */}
                    <div style={styles.botoes}>
                      {['PENDENTE', 'EM ANDAMENTO', 'FINALIZADO'].map(status => (
                        <button
                          key={status}
                          onClick={() => atualizarStatus(pedido.id, status)}
                          style={{
                            ...styles.statusBtn,
                            backgroundColor: pedido.status === status ?
                              (status === 'PENDENTE' ? '#ef4444' :
                               status === 'EM ANDAMENTO' ? '#f59e0b' : '#10b981')
                              : 'white',
                            color: pedido.status === status ? 'white' : '#1e293b',
                            borderColor: pedido.status === status ?
                              (status === 'PENDENTE' ? '#ef4444' :
                               status === 'EM ANDAMENTO' ? '#f59e0b' : '#10b981')
                              : '#e2e8f0'
                          }}
                        >
                          {status === 'PENDENTE' && '🔴'}
                          {status === 'EM ANDAMENTO' && '🟡'}
                          {status === 'FINALIZADO' && '🟢'}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          ⏰ Atualizado automaticamente a cada 1 minuto
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #ef4444'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ef4444'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px'
  },
  counter: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '3px solid',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '5px',
    color: '#ef4444'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  filtros: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: 'white'
  },
  aviso: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  pedidosContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    gridColumn: '1 / -1'
  },
  vazio: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    gridColumn: '1 / -1'
  },
  pedidoCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderTop: '4px solid',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  pedidoHeader: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    userSelect: 'none'
  },
  pedidoInfo: {
    flex: 1
  },
  pedidoData: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
    marginBottom: '5px'
  },
  pedidoNome: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '5px'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  arrow: {
    fontSize: '20px',
    color: '#64748b'
  },
  pedidoDetalhes: {
    padding: '20px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  detalhe: {
    marginBottom: '15px'
  },
  detalheLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '5px'
  },
  detalheValor: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  link: {
    display: 'inline-block',
    padding: '8px 12px',
    background: '#6366f1',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  semDado: {
    color: '#64748b',
    fontSize: '13px'
  },
  botoes: {
    display: 'flex',
    gap: '8px',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  statusBtn: {
    flex: 1,
    minWidth: '100px',
    padding: '10px',
    border: '2px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease'
  },
  footer: {
    textAlign: 'center',
    padding: '15px',
    color: '#64748b',
    fontSize: '12px',
    background: 'white',
    borderRadius: '6px'
  }
};
