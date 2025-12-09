import React, { useState, useEffect, useRef } from 'react';
import { AutorService } from '../../services/AutorService';
import type { Autor } from '../../../../backend/Models/Autor';
import './AutorCarousel.css';

const AutorCarousel: React.FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const data = await AutorService.getAll();
        setAutores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar autores');
      } finally {
        setLoading(false);
      }
    };

    fetchAutores();
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

  if (loading) return <div className="loading">Cargando autores...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (autores.length === 0) return <div className="empty">No se encontraron autores</div>;

  return (
    <div className="autor-carousel-container">
      <h2>Nuestros Autores</h2>
      <div className="carousel-controls">
        <button onClick={scrollLeft} className="carousel-button left" aria-label="Anterior">‹</button>
        
        <div className="autor-carousel" ref={carouselRef}>
          {autores.map((autor, index) => (
            <div 
                key={autor.idAutor || index} 
                className="carousel-autor-card"
            >
              <div className="carousel-autor-avatar" style={{ backgroundColor: getRandomColor() }}>
                {getInitials(autor.nombre)}
              </div>
              <div className="carousel-autor-info">
                <h3 className="carousel-autor-nombre">{autor.nombre}</h3>
                <p className="carousel-autor-nacionalidad">{autor.nacionalidad}</p>
                <p className="carousel-autor-biografia">
                  {truncateText(autor.biografia, 60)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={scrollRight} className="carousel-button right" aria-label="Siguiente">›</button>
      </div>
    </div>
  );
};

function getInitials(nombre: string): string {
  if (!nombre) return "?";
  return nombre.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getRandomColor(): string {
  const colors = [
    '#4a6fa5', '#166088', '#4fc3f7', 
    '#29b6f6', '#00838f', '#26c6da',
    '#5c6bc0', '#3949ab', '#7e57c2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default AutorCarousel;