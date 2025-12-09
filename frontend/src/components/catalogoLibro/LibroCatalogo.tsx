import { useState, useEffect } from 'react';
import type { FC } from 'react';
import LibroCard from '../cardLibro/LibroCard';
import { LibroService } from '../../services/LibroService';
import type { Libro } from '../../../../backend/Models/Libro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faRotateRight,
  faExclamationTriangle,
  faSearch,
  faFolder,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './LibroCatalogo.css';

const LibroCatalogo: FC = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 


  
  const [buscando, setBuscando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroTitulo, setFiltroTitulo] = useState<string>('');
  const [filtroGenero, setFiltroGenero] = useState<string>('');
  const [generosDisponibles, setGenerosDisponibles] = useState<string[]>([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);


  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const librosData = await LibroService.getAll();
        setLibros(librosData);
        const generos = [...new Set(librosData.map(libro => libro.genero).filter(Boolean))] as string[];
        setGenerosDisponibles(generos);
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
    const filtrarLibros = async () => {
      try {
        setBuscando(true); 
        setError(null);
        let librosFiltrados: Libro[] = [];

        if (filtroTitulo) {
          try {
            librosFiltrados = await LibroService.getByTitulo(filtroTitulo);
            if (librosFiltrados.length === 0) {
              setError(`No se encontraron libros con el título "${filtroTitulo}"`);
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('404')) {
              setLibros([]);
              setError(`No se encontraron libros con el título "${filtroTitulo}"`);
            } else {
              throw err;
            }
          }
        } else if (filtroGenero) {
          try {
            librosFiltrados = await LibroService.getByGenero(filtroGenero);
            if (librosFiltrados.length === 0) {
              setError(`No se encontraron libros del género "${filtroGenero}"`);
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('404')) {
              setLibros([]);
              setError(`No se encontraron libros del género "${filtroGenero}"`);
            } else {
              throw err;
            }
          }
        } else {
          librosFiltrados = await LibroService.getAll();
        }

        setLibros(librosFiltrados);
      } catch (err) {
        if (!(err instanceof Error && err.message.includes('404'))) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        setBuscando(false); 
      }
    };

    if (!filtroTitulo && !filtroGenero) {
         filtrarLibros();
         return;
    }

    const timer = setTimeout(() => {
      filtrarLibros();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroTitulo, filtroGenero]);

  const handleResetFiltros = () => {
    setFiltroTitulo('');
    setFiltroGenero('');
    setError(null);
  };

  const handleCardClick = (libro: Libro) => {
    setLibroSeleccionado(libro);
    setIsClosing(false);
  };

  const handleCloseSinopsis = () => {
    setIsClosing(true);
    setTimeout(() => {
      setLibroSeleccionado(null);
      setIsClosing(false);
    }, 300);
  };

  const handleImagenChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('apikey', 'K81703075988957');
    formData.append('language', 'spa');
    formData.append('isOverlayRequired', 'false');
    formData.append('file', file);

    try {
      setBuscando(true); 
      setError(null);

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const parsedText = data?.ParsedResults?.[0]?.ParsedText;

      if (!parsedText) {
        setError('No se pudo extraer texto de la imagen');
        return;
      }

     const tituloExtraido = parsedText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)[0];
      
      if (tituloExtraido) {
        setFiltroTitulo(tituloExtraido);
        setFiltroGenero('');
      } else {
        setError('Texto ilegible en la imagen');
      }
    } catch (err) {
      setError('Error al procesar la imagen');
    } finally {
      setBuscando(false);
    }
  };


  if (loading) {
    return (
      <div className="libro-catalogo-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="libro-catalogo-container">
      {libroSeleccionado && (
        <div
          className={`sinopsis-modal ${isClosing ? 'closing' : ''}`}
          onClick={handleCloseSinopsis}
        >
          <div
            className="sinopsis-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={handleCloseSinopsis}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{libroSeleccionado.titulo}</h2>
            <p className="sinopsis-text">{libroSeleccionado.sinopsis}</p>
            <div className="libro-info">
              <p><strong>Género:</strong> {libroSeleccionado.genero}</p>
            </div>
          </div>
        </div>
      )}

      <div className="header-section">
        <h1 className="catalog-title">Biblioteca Digital</h1>
        <p className="catalog-subtitle">Explora nuestra colección de libros</p>
      </div>

      <div className="filtros-container">
        <div className="filtros-content">
          <div className="filtro-group">
            <label htmlFor="filtro-titulo">
              <span className="label-icon">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              Buscar por título
            </label>
            <input
              id="filtro-titulo"
              type="text"
              value={filtroTitulo}
              onChange={(e) => {
                setFiltroTitulo(e.target.value);
                setFiltroGenero('');
              }}
              placeholder="Escribe el nombre del libro..."
              className="input-field"
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="filtro-genero">
              <span className="label-icon">
                <FontAwesomeIcon icon={faFolder} />
              </span>
              Filtrar por género
            </label>
            <select
              id="filtro-genero"
              value={filtroGenero}
              onChange={(e) => {
                setFiltroGenero(e.target.value);
                setFiltroTitulo('');
              }}
              className="select-field"
            >
              <option value="">Todos los géneros</option>
              {generosDisponibles.map((genero, index) => (
                <option key={genero || index} value={genero}>
                  {genero}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`reset-btn ${!filtroTitulo && !filtroGenero && !error ? 'disabled' : ''}`}
            onClick={handleResetFiltros}
            disabled={!filtroTitulo && !filtroGenero && !error}
          >
            <span className="btn-icon">
              <FontAwesomeIcon icon={faRotateRight} />
            </span>
            Limpiar
          </button>

          <div className="filtro-group">
            <label htmlFor="input-imagen">
              <span className="label-icon">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              Buscar Por Portada
            </label>
            <input
              id="input-imagen"
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="input-field"
            />
          </div>
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
        {!buscando && libros.length > 0 && (
          <div className="results-header">
            <h3 className="results-count">
              {libros.length} {libros.length === 1 ? 'libro encontrado' : 'libros encontrados'}
            </h3>
          </div>
        )}

        {!buscando && (
            <div className="libros-grid">
            {libros.length > 0 ? (
                libros.map((libro, index) => (
                <div
                    key={libro.idLibro || index}
                    onClick={() => handleCardClick(libro)}
                    className="libro-card-wrapper"
                >
                    <LibroCard libro={libro} />
                </div>
                ))
            ) : (
                !error && (
                <div className="no-results">
                    <div className="no-results-icon">
                    <FontAwesomeIcon icon={faBook} />
                    </div>
                    <h3>Sin resultados</h3>
                    <p>Prueba con otros términos de búsqueda</p>
                </div>
                )
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibroCatalogo;