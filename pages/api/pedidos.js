const SHEET_ID = '1w0vlByNIA18vSaaoPly71W2eG0ul2ht_KcPNjEmDE4I';
const SHEET_NAME = 'Respostas ao formulário 1';
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercache';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      // Dados de exemplo (em produção, puxaria do Google Sheets)
      const pedidos = [
        {
          id: 1,
          nome: 'Maria Silva',
          produto: 'Colágeno Hidrolisado 300g',
          data: '15/07/2026',
          comprovante: '#',
          status: 'PENDENTE'
        },
        {
          id: 2,
          nome: 'João Santos',
          produto: 'Vitamina C 1000mg - 60 caps',
          data: '18/07/2026',
          comprovante: '#',
          status: 'PENDENTE'
        },
        {
          id: 3,
          nome: 'Ana Costa',
          produto: 'Whey Protein Concentrado 1kg',
          data: '20/07/2026',
          comprovante: '#',
          status: 'EM ANDAMENTO'
        }
      ];

      res.status(200).json(pedidos);
    } else if (req.method === 'PUT') {
      // Atualizar status
      const { id } = req.query;
      const { status } = req.body;

      // Aqui você atualizaria no Google Sheets
      console.log(`Atualizando pedido ${id} para status ${status}`);

      res.status(200).json({ success: true, message: 'Status atualizado' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Erro ao processar requisição' });
  }
}
