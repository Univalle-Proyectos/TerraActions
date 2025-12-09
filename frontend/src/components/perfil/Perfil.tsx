import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../navBar/navBar";
import logo from '../../assets/logazo.png'; 
import { faHome, faUser, faBookReader, faSignOutAlt, faFeather, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import './Perfil.css';
import LibroCatalogo from "../catalogoLibro/LibroCatalogo";
import { fetchApi } from "../../services/api";
import MiPerfil from "../miPerfil/MiPerfil";
import AutorCatalogo from "../catalogoAutor/AutorCatalogo";
import ReservaCatalogo from "../catalogoReservas/CatalogoReservas";
import type { NavItem } from "../types/list";

const Perfil = () => {
  const [cliente, setCliente] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const [componenteActual, setComponenteActual] = useState<React.ReactNode>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await fetchApi("/auth/perfil");
        setCliente(data.cliente);
        setComponenteActual(<MiPerfil cliente={data.cliente} />);
      } catch (error: any) {
        console.error("Error de sesión:", error);
        setMensaje("Sesión expirada o inválida. Redirigiendo...");
        
        localStorage.removeItem("token");
        setTimeout(() => {
            navigate("/login");
        }, 2000); 
      }
    };

    fetchPerfil();
  }, [navigate]);

  const mostrarComponente = (id: string) => {
    if (!cliente) return;

    switch(id) {
      case "0":
        navigate('/');
        break;
      case "1":
        setComponenteActual(<MiPerfil cliente={cliente} />);
        break;
      case "2":
        setComponenteActual(<LibroCatalogo />);
        break;
      case "3":
        setComponenteActual(<AutorCatalogo />);
        break;
      case "4":
        setComponenteActual(<ReservaCatalogo ciCliente={cliente.ci_cliente } />);
        break;
      case "5":
        logout();
        break;
      default:
        setComponenteActual(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

 const menuItems: NavItem[] = [
    { 
      id: '0', 
      label: 'Inicio', 
      icon: faHome,
      onClick: () => mostrarComponente('0')
    },
    { 
      id: '1', 
      label: 'Mi Perfil', 
      icon: faUser,
      onClick: () => mostrarComponente('1')
    },
    { 
      id: '2', 
      label: 'Catálogo',
      icon: faBookReader,
      onClick: () => mostrarComponente('2')
    },
    { 
      id: '3', 
      label: 'Autores',
      icon: faFeather,
      onClick: () => mostrarComponente('3')
    },
    {
      id: "4",
      label: 'Reservar',
      icon: faNoteSticky,
      onClick: () => mostrarComponente('4')
    },
    { 
      id: '5', 
      label: 'Cerrar Sesión', 
      icon: faSignOutAlt,
      onClick: () => mostrarComponente('5')
    },
  ];

  if (mensaje) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', background: '#000' }}>
        <h2>{mensaje}</h2>
    </div>
  );

  if (!cliente) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', background: '#000' }}>
        <h2>Cargando perfil...</h2>
    </div>
  );

  return (
    <div className="page-container">
      <NavBar
        items={menuItems}
        logo={logo}
        logoAlt="Logo de la aplicación"
        className="home-navbar"
        username={cliente.usuario}
      />
      
      <div className="content-container">
        <main className="main-content">
          {componenteActual}
        </main>
      </div>
    </div>
  );
};

export default Perfil;