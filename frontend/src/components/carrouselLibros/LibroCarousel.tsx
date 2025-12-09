import React, { useState, useEffect, useRef } from 'react';
import { LibroService } from '../../services/LibroService';
import type { Libro } from '../../../../backend/Models/Libro';
import './LibroCarousel.css';
import logazo from '../../assets/logazo.png';

const LibroCarousel: React.FC = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const data = await LibroService.getAll();
        setLibros(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="loading">Cargando libros...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (libros.length === 0) return <div className="empty">No se encontraron libros</div>;

  return (
    <div className="libro-carousel-container">
      <button onClick={scrollLeft} className="carousel-button left">‹</button>
      
      <div className="libro-carousel" ref={carouselRef}>
        {libros.map((libro, index) => (
          <div 
            key={libro.idLibro || index} 
            className="carousel-card" 
          >
            <div className="carousel-portada-container">
              <img 
                src={libro.portada || logazo} 
                alt={`Portada de ${libro.titulo}`}
                className="carousel-portada-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-book-cover.jpg';
                }}
              />
            </div>
            <div className="carousel-info">
              <h3 className="carousel-titulo">{libro.titulo}</h3>
              <p className="carousel-editorial">{libro.editorial}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={scrollRight} className="carousel-button right">›</button>
    </div>
  );
};

export default LibroCarousel;