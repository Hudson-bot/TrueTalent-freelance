import React, { useRef } from "react";
import { motion } from "framer-motion";
import Lottie from "react-lottie";
import "./HowItWorks.css"; // Adjust the path as necessary

const HowItWorks = ({
  isVisible,
  developmentAnimationData,
  designAnimationData,
  collaborationAnimationData,
  freelanceAnimationData,
}) => {
  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  });
  const containerRef = useRef(null);

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container" ref={containerRef}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="section-title">
            How It <span className="highlight">Works</span>
          </h2>
          <p className="section-subtitle">
            Find and hire talent in just a few simple steps
          </p>
        </motion.div>

        <motion.div
          dragConstraints={containerRef}
          className="steps-container"
          drag="x"
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          style={{ cursor: "grab" }}
          whileTap={{ cursor: "grabbing" }}
        >
          {[
            {
              number: 1,
              title: "Post Your Project",
              desc: "Tell us what you need. Provide as much detail as possible.",
              animation: developmentAnimationData,
            },
            {
              number: 2,
              title: "Review Proposals",
              desc: "Compare offers from top freelancers worldwide.",
              animation: designAnimationData,
            },
            {
              number: 3,
              title: "Choose & Collaborate",
              desc: "Select the best match and work together seamlessly.",
              animation: collaborationAnimationData,
            },
            {
              number: 4,
              title: "Pay & Review",
              desc: "Pay only when you're satisfied with the delivered work.",
              animation: freelanceAnimationData,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * 0.2,
                  duration: 0.5,
                },
              }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(67, 97, 238, 0.2)",
              }}
            >
              <motion.div
                className="step-number"
                animate={{
                  scale: isVisible["how-it-works"] ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  delay: index * 0.3,
                  repeat: isVisible["how-it-works"] ? 1 : 0,
                }}
              >
                {step.number}
              </motion.div>
              <div className="step-animation">
                <Lottie
                  options={defaultLottieOptions(step.animation)}
                  height={120}
                  width={120}
                  isStopped={!isVisible["how-it-works"]}
                />
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
