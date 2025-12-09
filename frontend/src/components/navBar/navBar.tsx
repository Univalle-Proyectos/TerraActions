import type { FC } from 'react';
import { useState } from 'react';
import './navBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import imgBib from '../../assets/logazo.png';
import type { NavBarProps } from '../types/list';
import { SideBar } from '../sideBar/sideBar';

export const NavBar: FC<NavBarProps> = ({
  items,
  logo = imgBib,
  logoAlt = "Logo",
  className = "",
  username
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  const hasItems = items && items.length > 0;

  return (
    <>
      <nav className={`navbar ${className}`}>
        <div className="navbar-header">

          <div className="navbar-left">
            {hasItems && (
              <button
                className="navbar-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation"
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            )}
          </div>


          <div className="navbar-center">
            <div className="navbar-logo">
              <div className="logo-container">
                <img src={logo || "/placeholder.svg"} alt={logoAlt} width="45" height="45" />
                <div className="logo-glow"></div>
              </div>
              <div className="brand-text">
                <h1>Biblioverso</h1>
                <span className="brand-subtitle">Biblioteca Universal</span>
              </div>
            </div>
          </div>

          <div className="navbar-right"></div>
        </div>
      </nav>

      {hasItems && (
        <SideBar 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          items={items}
          username={username}
        />
      )}
    </>
  );
};