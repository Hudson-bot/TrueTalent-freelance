import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import "./Footer.css"; // Adjust the path as necessary

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <motion.div
              className="logo"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              True<span className="highlight">Talent</span>
            </motion.div>
            <p className="footer-tagline">
              Connecting businesses with world-class freelance talent.
            </p>
            <div className="social-links">
              {[FaLinkedin, FaFacebook, FaTwitter, FaInstagram].map(
                (Icon, index) => (
                  <motion.a
                    href="#"
                    key={index}
                    className="social-link"
                    whileHover={{ y: -5, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon />
                  </motion.a>
                )
              )}
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3>For Clients</h3>
              <ul>
                <li>
                  <a href="#">How to Hire</a>
                </li>
                <li>
                  <a href="#">Talent Marketplace</a>
                </li>
                <li>
                  <a href="#">Enterprise Solutions</a>
                </li>
                <li>
                  <a href="#">Success Stories</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>For Freelancers</h3>
              <ul>
                <li>
                  <a href="#">How to Find Work</a>
                </li>
                <li>
                  <a href="#">Create Profile</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
                <li>
                  <a href="#">Success Stories</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Guides</a>
                </li>
                <li>
                  <a href="#">Webinars</a>
                </li>
                <li>
                  <a href="#">Podcast</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} TrueTalent. All rights reserved.
          </div>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;