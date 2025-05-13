import React from "react";
import { motion } from "framer-motion";
import "./TalentSection.css"; // Adjust the path as necessary

const TalentSection = () => {
  return (
    <section id="top-talent" className="talent">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="section-title">
            Meet Our <span className="highlight">Top Talent</span>
          </h2>
          <p className="section-subtitle">
            Verified professionals ready to help with your next project
          </p>
        </motion.div>

        <div className="talent-grid">
          {[
            {
              name: "Alex Morgan",
              role: "Full-Stack Developer",
              rating: 4.9,
              projects: 87,
              hourly: "$65/hr",
              skills: ["React", "Node.js", "MongoDB"],
            },
            {
              name: "Sarah Chen",
              role: "UI/UX Designer",
              rating: 5.0,
              projects: 124,
              hourly: "$55/hr",
              skills: ["Figma", "Adobe XD", "User Research"],
            },
            {
              name: "David Wilson",
              role: "Mobile Developer",
              rating: 4.8,
              projects: 63,
              hourly: "$70/hr",
              skills: ["Flutter", "Swift", "React Native"],
            },
            {
              name: "Maya Patel",
              role: "Data Scientist",
              rating: 4.9,
              projects: 51,
              hourly: "$75/hr",
              skills: ["Python", "TensorFlow", "Data Visualization"],
            },
          ].map((talent, index) => (
            <motion.div
              className="talent-card"
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              whileHover={{
                y: -15,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="talent-avatar"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  backgroundImage: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
                }}
              >
                {talent.name[0]}
              </motion.div>
              <h3 className="talent-name">{talent.name}</h3>
              <div className="talent-role">{talent.role}</div>
              <div className="talent-rating">
                <motion.div
                  className="stars"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  {"★".repeat(Math.floor(talent.rating))}
                  {talent.rating % 1 > 0 ? "½" : ""}
                </motion.div>
                <span>({talent.projects} projects)</span>
              </div>
              <div className="talent-hourly">{talent.hourly}</div>
              <div className="talent-skills">
                {talent.skills.map((skill, i) => (
                  <span className="skill-tag" key={i}>
                    {skill}
                  </span>
                ))}
              </div>
              <motion.button
                className="btn btn-secondary talent-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Profile
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="talent-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse All Talent
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TalentSection;