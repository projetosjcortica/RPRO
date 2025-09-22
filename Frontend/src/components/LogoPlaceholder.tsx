const LogoPlaceholder = () => {
  return (
    <svg 
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      style={{ 
        backgroundColor: '#f3f4f6',
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      <rect x="10" y="10" width="80" height="80" fill="#E5E7EB" rx="5" />
      <text 
        x="50" 
        y="55" 
        fontSize="14" 
        textAnchor="middle" 
        fill="#4B5563"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        LOGO
      </text>
    </svg>
  );
};

export default LogoPlaceholder;