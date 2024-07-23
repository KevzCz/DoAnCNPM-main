import React, { useRef, useEffect, useContext } from "react";
import { Container, Row, Button } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import axios from 'axios';
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

const adminLinks = [
  {
    path: "/add-tour",
    display: "Add Tour",
  },
  {
    path: "/add-category",
    display: "Add Category",
  },
  {
    path: "/add-schedule",
    display: "Add Schedule",
  },
  {
    path: "/add-location",
    display: "Add Location",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.phone_number) {
        try {
          const res = await axios.get(`/user/profile?phone_number=${storedUser.phone_number}`);
          setUser(res.data);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchUserData();
  }, [setUser]);

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

  useEffect(() => {
    stickyHeaderFunc();
    return () => window.removeEventListener("scroll", stickyHeaderFunc);
  }, []);

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
                    <Link to="/tours" className="dropdown-item">All Tours</Link>
                    {user && user.role === 'NVQL_CT' && (
                      <>
                        {adminLinks.map((item, index) => (
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
                    <span className="username">{user.name}</span>
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">Thông tin tài khoản</Link>
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
