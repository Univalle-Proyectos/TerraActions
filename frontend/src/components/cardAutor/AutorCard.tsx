import React from 'react';
import type { Autor } from '../../../../backend/Models/Autor';
import './AutorCard.css';

interface AutorCardProps {
  autor: Autor;
}

const AutorCard: React.FC<AutorCardProps> = ({ autor }) => {
  return (
    <div className="autor-card">
      <div className="autor-avatar" style={{ backgroundColor: getRandomColor() }}>
        {getInitials(autor.nombre)}
      </div>
      <div className="autor-info">
        <h3 className="autor-nombre" title={autor.nombre}>
            {autor.nombre}
        </h3>
        
        <p className="autor-nacionalidad">{autor.nacionalidad}</p>
        
        <div className="autor-vida">
          <span>{autor.fechaNac}</span>
          {autor.fechaMuerte && <span> - {autor.fechaMuerte}</span>}
        </div>
        
        <p className="autor-biografia" title={autor.biografia}>
          {truncateText(autor.biografia, 100)}
        </p>
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
  if (!text) return "Sin biografía disponible";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default AutorCard;