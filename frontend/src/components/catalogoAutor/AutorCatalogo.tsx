import { useState, useEffect } from 'react';
import type { FC } from 'react';
import AutorCard from '../cardAutor/AutorCard';
import { AutorService } from '../../services/AutorService';
import type { Autor } from '../../../../backend/Models/Autor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faRotateRight, 
  faExclamationTriangle, 
  faPen, 
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './AutorCatalogo.css';

const AutorCatalogo: FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [buscando, setBuscando] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState<string>('');
  const [autorSeleccionado, setAutorSeleccionado] = useState<Autor | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const autoresData = await AutorService.getAll();
        setAutores(autoresData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const filtrarAutores = async () => {
      try {
        setBuscando(true);
        setError(null);
        let autoresFiltrados: Autor[] = [];

        if (filtroNombre) {
          try {
            autoresFiltrados = await AutorService.getByNombre(filtroNombre);
            if (autoresFiltrados.length === 0) {
              setError(`No se encontraron autores con el nombre "${filtroNombre}"`);
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('404')) {
              setAutores([]);
              setError(`No se encontraron autores con el nombre "${filtroNombre}"`);
            } else {
              throw err;
            }
          }
        } else {
          autoresFiltrados = await AutorService.getAll();
        }

        setAutores(autoresFiltrados);
      } catch (err) {
        if (!(err instanceof Error && err.message.includes('404'))) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        setBuscando(false);
      }
    };

    if (!filtroNombre) {
        filtrarAutores();
        return;
    }

    const timer = setTimeout(() => {
      filtrarAutores();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroNombre]);

  const handleResetFiltros = () => {
    setFiltroNombre('');
    setError(null);
  };

  const handleCardClick = (autor: Autor) => {
    setAutorSeleccionado(autor);
    setIsClosing(false);
  };

  const handleCloseBiografia = () => {
    setIsClosing(true);
    setTimeout(() => {
      setAutorSeleccionado(null);
      setIsClosing(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="autor-catalogo-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando autores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="autor-catalogo-container">
      {autorSeleccionado && (
        <div 
          className={`biografia-modal ${isClosing ? 'closing' : ''}`}
          onClick={handleCloseBiografia}
        >
          <div 
            className="biografia-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={handleCloseBiografia}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{autorSeleccionado.nombre}</h2>
            <p className="biografia-text">{autorSeleccionado.biografia}</p>
          </div>
        </div>
      )}

      <div className="header-section">
        <h1 className="catalog-title">Directorio de Autores</h1>
        <p className="catalog-subtitle">Conoce a los escritores de nuestra colección</p>
      </div>

      <div className="filtros-container">
        <div className="filtros-content">
          <div className="filtro-group">
            <label htmlFor="filtro-nombre">
              <span className="label-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              Buscar autor
            </label>
            <input
              id="filtro-nombre"
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Escribe el nombre del autor..."
              className="input-field"
            />
          </div>

          <button
            className={`reset-btn ${!filtroNombre && !error ? 'disabled' : ''}`}
            onClick={handleResetFiltros}
            disabled={!filtroNombre && !error}
          >
            <span className="btn-icon">
              <FontAwesomeIcon icon={faRotateRight} />
            </span>
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="error-message">{error}</div>
        </div>
      )}

      {buscando && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p style={{ marginTop: '10px' }}>Buscando...</p>
        </div>
      )}

      <div className="results-section" style={{ opacity: buscando ? 0.5 : 1 }}>
        {!buscando && autores.length > 0 && (
          <div className="results-header">
            <h3 className="results-count">
              {autores.length} {autores.length === 1 ? 'autor encontrado' : 'autores encontrados'}
            </h3>
          </div>
        )}

        {!buscando && (
            <div className="autores-grid">
            {autores.length > 0 ? (
                autores.map((autor, index) => (
                <div 
                    key={autor.idAutor || index} 
                    onClick={() => handleCardClick(autor)}
                    className="autor-card-wrapper"
                >
                    <AutorCard autor={autor} />
                </div>
                ))
            ) : (
                !error && (
                <div className="no-results">
                    <div className="no-results-icon">
                    <FontAwesomeIcon icon={faPen} />
                    </div>
                    <h3>Sin resultados</h3>
                    <p>No encontramos autores con ese nombre</p>
                </div>
                )
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AutorCatalogo;