import React from 'react';
import { useNavigate } from 'react-router-dom';
import data from './data/patch-notes.json';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) navigate(-1); }}>
      <DialogContent>
        <div style={styles.container}>
          {/* Logo e Nome do Sistema */}
          <header style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
              <img src={logo || data.companyLogo} alt="Cortez" style={styles.logo} />
              <img src={monoLogo} alt="J.Cortiça" style={styles.monoLogo} />
            </div>
            <h1 style={styles.title}>{data.appName}</h1>
            <p style={styles.version}>Versão: {data.version} (Build: {data.buildDate})</p>
            <DialogDescription style={{ color: '#666', marginTop: 6 }}>{data.tagline}</DialogDescription>
          </header>

          {/* Patch Notes */}
          <section style={styles.patchNotesSection}>
            <h2>Histórico de Atualizações</h2>
            {data.patchNotes.map((note, index) => (
              <div key={index} style={styles.noteCard}>
                <div style={styles.noteHeader}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={styles.noteVersion}>{note.version}</span>
                    <span style={styles.noteDate}>{note.date}</span>
                  </div>
                  <h3 style={styles.noteTitle}>{note.title}</h3>
                </div>
                <ul style={styles.noteList}>
                  {note.changes.map((change, i) => (
                    <li key={i} style={styles.noteItem}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Estilos CSS inline
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  logo: {
    width: '150px',
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
  },
  version: {
    margin: '5px 0',
    fontSize: '1rem',
    color: '#666',
  },
  patchNotesSection: {
    marginTop: '20px',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap' as const,
  },
  noteVersion: {
    fontWeight: 'bold',
    color: '#007acc',
    fontSize: '1.1rem',
  },
  noteDate: {
    color: '#888',
    fontSize: '0.9rem',
  },
  noteTitle: {
    margin: '0',
    fontSize: '1.2rem',
    color: '#333',
    flexBasis: '100%',
  },
  noteList: {
    margin: 0,
    paddingLeft: '20px',
  },
  noteItem: {
    margin: '5px 0',
    color: '#444',
  },
};

export default About;
