import React from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  title?: string;
}

/**
 * Componente para mostrar texto truncado com reticências e tooltip quando maior que o tamanho máximo
 * @param text Texto a ser exibido
 * @param maxLength Tamanho máximo (padrão: 25 caracteres)
 * @param className Classes adicionais
 * @param title Texto específico para o tooltip (se não fornecido, usa o texto completo)
 */
export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 25,
  className = '',
  title,
}) => {
  // Garantir que text é uma string válida
  const safeText = text || '';
  const shouldTruncate = safeText.length > maxLength;
  const displayText = shouldTruncate ? `${safeText.substring(0, maxLength)}...` : safeText;
  const tooltipText = title || safeText;

  return (
    <span 
      title={shouldTruncate ? tooltipText : undefined} 
      className={`truncate ${className}`}
    >
      {displayText}
    </span>
  );
};

export default TruncatedText;