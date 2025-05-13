import React from "react";
import { motion } from "framer-motion";
import "./PricingSection.css"; // Adjust the path as necessary

const PricingSection = () => {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="section-title">
            Simple, Transparent <span className="highlight">Pricing</span>
          </h2>
          <p className="section-subtitle">
            Choose the plan that works best for your needs
          </p>
        </motion.div>

        <div className="pricing-grid">
          {[
            {
              name: "Basic",
              price: "₹499",
              period: "per month",
              description: "Perfect for individuals and small projects",
              features: [
                "Up to 3 active projects",
                "Basic talent matching",
                "Secure payments",
                "24/7 support",
              ],
              popular: false,
              color: "var(--secondary-color)",
            },
            {
              name: "Pro",
              price: "₹699",
              period: "per month",
              description: "Ideal for businesses and growing teams",
              features: [
                "Up to 15 active projects",
                "Priority talent matching",
                "Secure payments",
                "24/7 priority support",
                "Custom contracts",
                "Team collaboration tools",
              ],
              popular: true,
              color: "var(--primary-color)",
            },
            {
              name: "Enterprise",
              price: "₹999",
              period: "per month",
              description: "For large organizations with complex needs",
              features: [
                "Unlimited active projects",
                "VIP talent matching",
                "Secure payments",
                "24/7 dedicated support",
                "Custom contracts",
                "Advanced team collaboration",
                "Custom integrations",
                "Dedicated account manager",
              ],
              popular: false,
              color: "var(--tertiary-color)",
            },
          ].map((plan, index) => (
            <motion.div
              className={`pricing-card ${plan.popular ? "popular" : ""}`}
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 200}
              whileHover={{
                y: -20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                borderTopColor: plan.popular ? plan.color : "transparent",
              }}
            >
              {plan.popular && (
                <div
                  className="popular-badge"
                  style={{ backgroundColor: plan.color }}
                >
                  Most Popular
                </div>
              )}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="feature-icon">✓</span> {feature}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                className={`btn ${
                  plan.popular ? "btn-primary" : "btn-outline"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: plan.popular ? plan.color : "transparent",
                  borderColor: plan.popular
                    ? plan.color
                    : "var(--border-color)",
                  color: plan.popular ? "white" : "var(--text-color)",
                }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;