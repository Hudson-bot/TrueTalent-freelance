import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TestimonialsSection.css"; // Adjust the path as necessary

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const testimonials = [
    {
      text: "Finding skilled developers was always a challenge until I discovered TrueTalent. Within days, I connected with an amazing team who transformed our concept into a fully-functional platform. The quality exceeded our expectations!",
      author: "Jessica Donovan",
      title: "CTO, LaunchPad Startups",
      initials: "JD",
      rating: 5,
      project: "Web Platform Development",
    },
    {
      text: "TrueTalent connected me with a designer who perfectly understood my brand vision. The collaboration was seamless, and the results were outstanding.",
      author: "Michael Chen",
      title: "Founder, Newleaf Brands",
      initials: "MC",
      rating: 5,
      project: "Brand Identity & Packaging",
    },
    {
      text: "As a startup with a tight budget, finding quality talent seemed impossible until we tried TrueTalent. The platform matched us with professionals who delivered beyond our expectations.",
      author: "Priya Sharma",
      title: "CEO, Innovate Solutions",
      initials: "PS",
      rating: 4.9,
      project: "Mobile App Development",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="testimonials">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="section-title">
            Client <span className="highlight">Success Stories</span>
          </h2>
          <p className="section-subtitle">
            What our clients have to say about our freelancers
          </p>
        </motion.div>

        <div className="testimonial-carousel">
          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                className={`testimonial-indicator ${
                  activeTestimonial === index ? "active" : ""
                }`}
                onClick={() => setActiveTestimonial(index)}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              className="testimonial-card"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="testimonial-content">
                <div className="quote-icon">❝</div>
                <p className="testimonial-text">
                  {testimonials[activeTestimonial].text}
                </p>
                <div className="testimonial-project">
                  Project: {testimonials[activeTestimonial].project}
                </div>
                <div className="testimonial-rating">
                  {"★".repeat(
                    Math.floor(testimonials[activeTestimonial].rating)
                  )}
                  {testimonials[activeTestimonial].rating % 1 > 0 ? "½" : ""}
                  <span className="rating-value">
                    ({testimonials[activeTestimonial].rating.toFixed(1)})
                  </span>
                </div>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonials[activeTestimonial].initials}
                </div>
                <div className="author-info">
                  <div className="author-name">
                    {testimonials[activeTestimonial].author}
                  </div>
                  <div className="author-title">
                    {testimonials[activeTestimonial].title}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;