import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export interface PDFRedirectOptions {
  data?: any;
  filtros?: any;
  resumo?: any;
  produtosInfo?: any;
  tableData?: any;
  context?: 'report' | 'home' | 'custom';
}

export function usePDFRedirect() {
  const navigate = useNavigate();

  const redirectToPDFPage = (options: PDFRedirectOptions = {}) => {
    // Salvar dados no localStorage para serem usados na página de relatórios personalizados
    if (options.data || options.filtros || options.resumo) {
      const pdfData = {
        data: options.data,
        filtros: options.filtros,
        resumo: options.resumo,
        produtosInfo: options.produtosInfo,
        tableData: options.tableData,
        context: options.context || 'report',
        timestamp: Date.now()
      };
      
      localStorage.setItem('pdf-generation-data', JSON.stringify(pdfData));
    }

    // Mostrar toast informativo
    toast.info('Redirecionando para relatórios personalizados...', {
      autoClose: 2000
    });

    // Navegar para a página de relatórios personalizados
    navigate('/custom-reports');
  };

  const handleLegacyPDFClick = (options: PDFRedirectOptions = {}) => {
    redirectToPDFPage({
      ...options,
      context: 'report'
    });
  };

  return {
    redirectToPDFPage,
    handleLegacyPDFClick
  };
}