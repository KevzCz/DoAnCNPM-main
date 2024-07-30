import React, { useRef, useEffect, useContext, useState } from "react";
import { Container, Row, Button } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import AuthContext from '../../context/AuthContext';
import logo from "../../assets/images/logo.png";
import avt from "../../assets/images/ava-1.jpg";
import "./header.css";

const nav__links = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/about",
    display: "About",
  },
];

const NVQLCTLinks = [
  {
    path: "/admin",
    display: "Admin Panel",
  },
  {
    path: "/add-tour",
    display: "Add Tour",
    submenu: [
      {
        path: "/tours/active",
        display: "Active Tours",
      },
      {
        path: "/tours/unactive",
        display: "Unactive Tours",
      },
    ],
  },
  {
    path: "/add-location",
    display: "Add Location",
  },
];

const AdminLinks = [
  {
    path: "/add-category",
    display: "Add Category",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const { user, setUser } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: '',
    gender: '',
    birth_date: '',
    role: '',
    phone_number: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const stickyHeaderFunc = () => {
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    });
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const textResponse = await response.text();

      if (response.ok) {
        const userData = JSON.parse(textResponse);
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          gender: userData.gender || '',
          birth_date: userData.birth_date ? addOneDay(userData.birth_date) : '',
          role: userData.role || '',
          phone_number: userData.phone_number || ''
        });
      } else {
        console.error('Failed to fetch user profile:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      fetchUserProfile();
    }
  });

  useEffect(() => {
    stickyHeaderFunc();
    return () => window.removeEventListener("scroll", stickyHeaderFunc);
  }, []);

  const addOneDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper d-flex align-items-center justify-content-between">
            <div className="logo">
              <img src={logo} alt="Logo" />
            </div>

            <div className="navigation">
              <ul className="menu d-flex align-items-center gap-5">
                {nav__links.map((item, index) => (
                  <li className="nav__item" key={index}>
                    <NavLink
                      to={item.path}
                      className={(navClass) =>
                        navClass.isActive ? "active__link" : ""
                      }
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}
                <li className="nav__item dropdown-header">
                  <span className="dropdown-toggle username">
                    Tours
                  </span>
                  <div className="dropdown-menu">
                    <Link to="/active-tours-itinerary" className="dropdown-item">All Tours</Link>
                    {user && user.role === 'NVQL_CT' && (
                      <>
                        {NVQLCTLinks.map((item, index) => (
                          <div className="dropdown-item dropdown-parent" key={index}>
                            <Link to={item.path}>
                              {item.display}
                            </Link>
                            {item.submenu && (
                              <div className="dropdown-submenu">
                                {item.submenu.map((subItem, subIndex) => (
                                  <Link to={subItem.path} className="dropdown-item" key={subIndex}>
                                    {subItem.display}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    {user && user.role === 'NVQL_HT' && (
                      <>
                        {AdminLinks.map((item, index) => (
                          <Link to={item.path} className="dropdown-item" key={index}>
                            {item.display}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </li>
              </ul>
            </div>

            <div className="nav__right d-flex align-items-center gap-4">
              <div className="nav__btns d-flex align-items-center gap-4">
                {user ? (
                  <div className="dropdown-header">
                    <img src={user.photo ? user.photo : avt} alt="Avatar" className="avatar" />
                    <span className="username">{profileData.name}</span>
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">Thông tin tài khoản</Link>
                      <Link to="/invoices" className="dropdown-item">Lịch sử đặt tour</Link>
                      <span className="dropdown-item" onClick={handleLogout}>Đăng xuất</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button className="btn secondary__btn">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="btn primary__btn">
                      <Link to="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
              <span className="mobile__menu">
                <i className="ri-menu-line"></i>
              </span>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
