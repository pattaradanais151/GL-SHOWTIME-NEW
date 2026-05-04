import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/license">License Agreement</Link>
      </div>
      <div className="footer-copy">
        &copy; {currentYear} GL SHOWTIME TH. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;