import React from "react";
import { motion } from "framer-motion";
import "./CTASection.css"; 

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="cta-title">
            Ready to Find Your Perfect{" "}
            <span className="highlight">Talent Match?</span>
          </h2>
          <p className="cta-subtitle">
            Join thousands of businesses who trust TrueTalent for their
            freelance needs
          </p>
          <motion.button
            className="btn btn-primary btn-large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started For Free
          </motion.button>
          <p className="cta-note">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;