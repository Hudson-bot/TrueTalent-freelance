import React from "react";
import { motion } from "framer-motion";
import "./ServicesSection.css"; // Adjust the path as necessary

const ServicesSection = () => {
  return (
    <section id="services" className="services">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="section-title">
            Explore <span className="highlight">Top Services</span>
          </h2>
          <p className="section-subtitle">
            Find expert freelancers in these popular categories
          </p>
        </motion.div>

        <div className="service-grid">
          {[
            {
              icon: "💻",
              title: "Web Development",
              desc: "Professional websites & web applications",
              delay: 0,
            },
            {
              icon: "🎨",
              title: "Design & Creative",
              desc: "Stunning visuals & branding materials",
              delay: 0.1,
            },
            {
              icon: "📱",
              title: "Mobile Development",
              desc: "iOS, Android & cross-platform apps",
              delay: 0.2,
            },
            {
              icon: "📊",
              title: "Data & Analytics",
              desc: "Data processing & visualization",
              delay: 0.3,
            },
            {
              icon: "🔍",
              title: "SEO & Marketing",
              desc: "Grow your online presence & traffic",
              delay: 0.4,
            },
            {
              icon: "✍️",
              title: "Content Writing",
              desc: "Engaging content that converts",
              delay: 0.5,
            },
            {
              icon: "🛒",
              title: "E-Commerce",
              desc: "Build & optimize online stores",
              delay: 0.6,
            },
            {
              icon: "🎬",
              title: "Video & Animation",
              desc: "Compelling video content",
              delay: 0.7,
            },
          ].map((service, index) => (
            <motion.div
              className="service-card"
              key={index}
              data-aos="fade-up"
              data-aos-delay={service.delay * 1000}
              whileHover={{
                y: -10,
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                backgroundColor: "var(--primary-light)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="service-icon"
                whileHover={{ rotate: 15, scale: 1.2 }}
              >
                {service.icon}
              </motion.div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;