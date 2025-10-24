import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Set backend URL
axios.defaults.baseURL = "https://backend-cars-ghassen.onrender.com";

function App() {
  const [page, setPage] = useState("store");
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLogin, setAdminLogin] = useState({ username: "", password: "" });

  // Admin form state
  const [carName, setCarName] = useState("");
  const [carDetails, setCarDetails] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [carPhoto, setCarPhoto] = useState(null);

  // Order form state
  const [clientName, setClientName] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleLogoClick = () => {
    window.location.reload();
  };

  const goToAbout = () => setPage("about");
  const goToStore = () => setPage("store");

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin4545') setShowAdminLogin(true);
      else if (window.location.hash === '#store') setPage("store");
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get("/api/public/cars");
      setCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/admin/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminLogin.username === "admin" && adminLogin.password === "admin123") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminLogin({ username: "", password: "" });
      setPage("admin");
      fetchOrders();
      window.location.hash = '';
    } else {
      alert("Invalid admin credentials!");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setPage("store");
    setOrders([]);
    window.location.hash = 'store';
  };

  // 🔥 Modified handleAddCar to upload to Cloudinary
  const handleAddCar = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Admin access required!");
      return;
    }

    try {
      let photoUrl = "";
      if (carPhoto) {
        const formData = new FormData();
        formData.append("file", carPhoto);
        formData.append("upload_preset", "cars_upload");
        formData.append("folder", "ghssen_cars");
        const cloudResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dt8tuds2a/image/upload",
          formData
        );
        photoUrl = cloudResponse.data.secure_url;
      }

      const response = await axios.post("/api/admin/cars", {
        name: carName,
        details: carDetails,
        price: carPrice,
        photo: photoUrl,
      });

      if (response.status === 201) {
        alert("Car added successfully!");
        setCarName("");
        setCarDetails("");
        setCarPrice("");
        setCarPhoto(null);
        fetchCars();
      }
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Failed to add car.");
    }
  };

  const handleDeleteCar = async (id) => {
    if (!isAdmin) {
      alert("Admin access required!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await axios.delete(`/api/admin/cars/${id}`);
        fetchCars();
      } catch (error) {
        console.error("Error deleting car:", error);
      }
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/public/orders", {
        carName: selectedCar.name,
        carPrice: selectedCar.price,
        clientName,
        wilaya,
        phone,
        email,
      });
      if (response.status === 201) {
        alert("Order placed successfully! We will contact you soon.");
        setClientName("");
        setWilaya("");
        setPhone("");
        setEmail("");
        setSelectedCar(null);
        if (isAdmin) fetchOrders();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!isAdmin) {
      alert("Admin access required!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`/api/admin/orders/${id}`);
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  // Footer Component
  const Footer = () => (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>GHSSEN CARS</h3>
          <p>Your trusted partner for luxury and performance vehicles. We provide the best cars with confidence and reliability.</p>
          <div className="social-links">
            <a href="https://instagram.com/ghassencars" className="social-link instagram" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://facebook.com/ghassencars" className="social-link facebook" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/ghassencars" className="social-link twitter" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://tiktok.com/@ghassencars" className="social-link tiktok" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://wa.me/213775818782" className="social-link whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a href="#store" onClick={goToStore}>
                <i className="fas fa-home"></i>
                Home
              </a>
            </li>
            <li>
              <a href="#about" onClick={goToAbout}>
                <i className="fas fa-info-circle"></i>
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" onClick={() => document.querySelector('.footer')?.scrollIntoView({behavior: 'smooth'})}>
                <i className="fas fa-envelope"></i>
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-phone-alt"></i>
              <span>+213 775 81 87 82</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>ghassenyounes89@gmail.com</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Algiers, Algeria</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Business Hours</h4>
          <div className="business-hours">
            <div className="hour-item">
              <span className="hour-day">Monday - Friday</span>
              <span className="hour-time">8:00 AM - 8:00 PM</span>
            </div>
            <div className="hour-item">
              <span className="hour-day">Saturday</span>
              <span className="hour-time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hour-item">
              <span className="hour-day">Sunday</span>
              <span className="hour-time">10:00 AM - 4:00 PM</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          <i className="fas fa-copyright"></i> 2024 GHSSEN CARS. All rights reserved. 
        </p>
      </div>
    </footer>
  );

  // About Page Component
  const AboutPage = () => (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-content">
          <h1 className="about-title">About GHSSEN CARS</h1>
          <p className="about-subtitle">Your Trusted Partner in Luxury and Performance Vehicles</p>
        </div>
      </div>

      <div className="about-sections">
        <div className="about-card">
          <i className="fas fa-car-side"></i>
          <h3>Premium Car Selection</h3>
          <p>We offer a carefully curated selection of luxury and performance vehicles. Each car is thoroughly inspected to ensure the highest quality and reliability for our customers.</p>
        </div>

        <div className="about-card">
          <i className="fas fa-award"></i>
          <h3>Confidence & Trust</h3>
          <p>With years of experience in the automotive industry, we've built a reputation for trust and reliability. Our customers choose us because they know we deliver excellence.</p>
        </div>

        <div className="about-card">
          <i className="fas fa-headset"></i>
          <h3>Exceptional Support</h3>
          <p>From the moment you contact us to long after your purchase, our dedicated team is here to provide exceptional customer service and support.</p>
        </div>
      </div>

      <div className="team-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="team-grid">
          <div className="team-member">
            <i className="fas fa-check-circle" style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}></i>
            <h4>Quality Assurance</h4>
            <p>Every vehicle undergoes rigorous inspection and quality checks</p>
          </div>
          <div className="team-member">
            <i className="fas fa-tag" style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}></i>
            <h4>Best Prices</h4>
            <p>Competitive pricing without compromising on quality</p>
          </div>
          <div className="team-member">
            <i className="fas fa-user-check" style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}></i>
            <h4>Customer First</h4>
            <p>Your satisfaction is our top priority</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2 className="cta-title">Ready to Find Your Dream Car?</h2>
        <p className="cta-text">Browse our extensive collection of premium vehicles and experience the GHSSEN CARS difference.</p>
        <div className="cta-buttons">
          <button className="back-btn" onClick={goToStore}>
            <i className="fas fa-car"></i> Browse Cars
          </button>
          <button className="submit-btn" onClick={() => document.querySelector('.footer')?.scrollIntoView({behavior: 'smooth'})}>
            <i className="fas fa-phone"></i> Contact Us
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="logo" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
          GHSSEN CARS
        </h1>
        <nav className="nav">
          <button
            className={page === "store" ? "nav-btn active" : "nav-btn"}
            onClick={goToStore}
          >
            Store
          </button>
          
          <button
            className={page === "about" ? "nav-btn active" : "nav-btn"}
            onClick={goToAbout}
          >
            About Us
          </button>
          
          {isAdmin && (
            <>
              <button
                className={page === "admin" ? "nav-btn active" : "nav-btn"}
                onClick={() => {
                  setPage("admin")
                  window.location.hash = 'admin'
                }}
              >
                Admin Panel
              </button>
              <button className="logout-btn" onClick={handleAdminLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      {page === "store" && (
        <div className="store-page">
          <div className="hero">
            <h2 className="hero-title">Welcome to Ghssen Cars</h2>
            <p className="hero-text">Find your dream car today</p>
          </div>

          <div className="cars-section">
            <h3 className="section-title">Available Cars</h3>
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car._id} className="car-card">
                  {car.photo && (
                    <img
                      src={car.photo.includes('cloudinary') ? car.photo : `https://backend-cars-ghassen.onrender.com${car.photo}`}
                      alt={car.name}
                      className="car-image"
                    />
                  )}
                  <div className="car-content">
                    <h4 className="car-name">{car.name}</h4>
                    <p className="car-details">{car.details}</p>
                    <p className="car-price">${car.price}</p>
                    <button
                      className="order-btn"
                      onClick={() => setSelectedCar(car)}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCar && (
            <div className="modal">
              <div className="modal-content">
                <button
                  className="close-btn"
                  onClick={() => setSelectedCar(null)}
                >
                  ×
                </button>
                <h3 className="modal-title">Order {selectedCar.name}</h3>
                <form className="order-form" onSubmit={handleOrder}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Wilaya"
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    className="input"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    className="input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="submit-btn">
                    Place Order
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {page === "about" && <AboutPage />}

      {/* Admin Login Modal */}
      {showAdminLogin && !isAdmin && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => {
                setShowAdminLogin(false)
                window.location.hash = 'store'
              }}
            >
              ×
            </button>
            <h2 className="modal-title">Admin Login</h2>
            <form className="login-form" onSubmit={handleAdminLogin}>
              <input
                type="text"
                className="input"
                placeholder="Username"
                value={adminLogin.username}
                onChange={(e) => setAdminLogin({...adminLogin, username: e.target.value})}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={adminLogin.password}
                onChange={(e) => setAdminLogin({...adminLogin, password: e.target.value})}
                required
              />
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {page === "admin" && isAdmin && (
        <div className="admin-page">
          <h2 className="page-title">Admin Panel</h2>

          <div className="admin-section">
            <h3 className="section-title">Customer Orders ({orders.length})</h3>
            <div className="orders-list">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h4 className="order-car-name">{order.carName}</h4>
                      <span className="order-price">${order.carPrice}</span>
                    </div>
                    <div className="order-details">
                      <p><strong>Client:</strong> {order.clientName}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Wilaya:</strong> {order.wilaya}</p>
                      <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete Order
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-orders">No orders yet</p>
              )}
            </div>
          </div>

          <div className="admin-section">
            <h3 className="section-title">Add New Car</h3>
            <form className="admin-form" onSubmit={handleAddCar}>
              <input
                type="text"
                className="input"
                placeholder="Car Name"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                required
              />
              <textarea
                className="textarea"
                placeholder="Car Details"
                value={carDetails}
                onChange={(e) => setCarDetails(e.target.value)}
                required
              />
              <input
                type="number"
                className="input"
                placeholder="Price"
                value={carPrice}
                onChange={(e) => setCarPrice(e.target.value)}
                required
              />
              <input
                type="file"
                className="file-input"
                accept="image/*"
                onChange={(e) => setCarPhoto(e.target.files[0])}
                required
              />
              <button type="submit" className="submit-btn">
                Add Car
              </button>
            </form>
          </div>

          <div className="admin-section">
            <h3 className="section-title">Manage Cars</h3>
            <div className="admin-cars-list">
              {cars.map((car) => (
                <div key={car._id} className="admin-car-card">
                  {car.photo && (
                    <img
                      src={car.photo.includes('cloudinary') ? car.photo : `https://backend-cars-ghassen.onrender.com${car.photo}`}
                      alt={car.name}
                      className="admin-car-image"
                    />
                  )}
                  <div className="admin-car-info">
                    <h4 className="car-name">{car.name}</h4>
                    <p className="car-details">{car.details}</p>
                    <p className="car-price">${car.price}</p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCar(car._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;