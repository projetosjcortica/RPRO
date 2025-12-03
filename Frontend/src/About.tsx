import React from 'react';
import { useNavigate } from 'react-router-dom';
import packageJson from '../package.json';
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from './components/ui/dialog';
import logo from './public/logo.png';
import monoLogo from './public/logoCmono.png';

/**
 * About component rendered as a modal dialog when mounted inside a route.
 * Closing the dialog navigates back to the previous page.
 */
const About: React.FC = () => {
  const navigate = useNavigate();
  const appVersion = packageJson.version;
  const appName = 'Cortez';

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) navigate(-1); }}>
      <DialogContent className="max-w-2xl">
       
          {/* Logo e Nome do Sistema */}
          <header style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
              <img src={logo} alt="Cortez" style={styles.logo} />
              <img src={monoLogo} alt="J.Cortiça" style={styles.monoLogo} />
            </div>
            <h1 style={styles.title}>{appName}</h1>
            <p style={styles.version}>Versão {appVersion}</p>
            <DialogDescription style={{ color: '#666', marginTop: 12, fontSize: '0.95rem', textAlign: 'center' }}>
              A inteligência por trás do seu controle
            </DialogDescription>
          </header>

      </DialogContent>
    </Dialog>
  );
};

// Estilos CSS inline
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  logo: {
    width: '80px',
    height: 'auto',
    marginBottom: '10px',
  },
  monoLogo: {
    width: '120px',
    height: 'auto',
    opacity: 0.9,
    marginBottom: '10px',
  },
  title: {
    margin: '10px 0',
    fontSize: '2rem',
    color: '#333',
    textTransform: 'capitalize' as const,
  },
  version: {
    margin: '5px 0',
    fontSize: '1.1rem',
    color: '#666',
    fontWeight: 'bold' as const,
  },
  infoSection: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.3rem',
    color: '#007acc',
    borderBottom: '2px solid #007acc',
    paddingBottom: '8px',
  },
  infoText: {
    margin: '8px 0',
    color: '#444',
    lineHeight: '1.6',
  },
  featureList: {
    margin: '10px 0',
    paddingLeft: '20px',
    color: '#444',
  },
};

export default About;
