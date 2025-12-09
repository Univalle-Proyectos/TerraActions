import './sideBar.css';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import type { NavItem } from '../types/list';

interface SideBarProps {
    isOpen: boolean;
    onClose: () => void;
    items: NavItem[];
    username?: string;
}

export const SideBar: FC<SideBarProps> = ({
    isOpen,
    onClose,
    items,
    username
}) => {
    
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        if (isOpen) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    const handleItemClick = (item: NavItem) => {
        if (item.onClick) {
            item.onClick();
        }
        onClose(); 
    };

    const mainItems = items.filter(item => item.id !== '5');
    const bottomItem = items.find(item => item.id === '5');
    
    return (
        <>
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={onClose}
                    role="button"
                    aria-label="Cerrar menú"
                    tabIndex={0}
                    onTouchMove={(e) => e.preventDefault()}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {username && (
                    <div className="sidebar-header">
                        <div className="user-avatar">
                            <FontAwesomeIcon icon={faUser} className="avatar-icon" />
                            <div className="avatar-glow"></div>
                        </div>
                        <div className="user-info">
                            <h3 className="welcome-text">Bienvenido</h3>
                            <span className="username">{username}</span>
                        </div>
                    </div>
                )}

                <nav className="sidebar-menu">
                    <ul>
                        {mainItems.map((item, index) => (
                            <li 
                                key={item.id} 
                                className="sidebar-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {item.href ? (
                                    <Link 
                                        to={item.href} 
                                        className="item-content-link"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <div className="item-content">
                                            {item.icon && (
                                                <span className="sidebar-icon">
                                                    <FontAwesomeIcon icon={item.icon} />
                                                </span>
                                            )}
                                            <span className="sidebar-label">{item.label}</span>
                                            <div className="item-glow"></div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div 
                                        className="item-content"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item.icon && (
                                            <span className="sidebar-icon">
                                                <FontAwesomeIcon icon={item.icon} />
                                            </span>
                                        )}
                                        <span className="sidebar-label">{item.label}</span>
                                        <div className="item-glow"></div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    {bottomItem && (
                        bottomItem.href ? (
                            <div className="sidebar-item logout-item">
                                <Link 
                                    to={bottomItem.href}
                                    className="item-content-link"
                                    onClick={() => handleItemClick(bottomItem)}
                                >
                                    <div className="item-content logout-content">
                                        {bottomItem.icon && (
                                            <span className="sidebar-icon">
                                                <FontAwesomeIcon icon={bottomItem.icon} />
                                            </span>
                                        )}
                                        <span className="sidebar-label">{bottomItem.label}</span>
                                        <div className="item-glow"></div>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div 
                                className="sidebar-item logout-item"
                                onClick={() => handleItemClick(bottomItem)}
                            >
                                <div className="item-content logout-content">
                                    {bottomItem.icon && (
                                        <span className="sidebar-icon">
                                            <FontAwesomeIcon icon={bottomItem.icon} />
                                        </span>
                                    )}
                                    <span className="sidebar-label">{bottomItem.label}</span>
                                    <div className="item-glow"></div>
                                </div>
                            </div>
                        )
                    )}
                    <div className="footer-decoration"></div>
                </div>
            </aside>
        </>
    );
};