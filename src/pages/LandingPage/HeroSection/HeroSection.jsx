import React, { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "react-lottie";
import { TypeAnimation } from "react-type-animation";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import ClientInfoModal from "../../../components/hire/ClientInfoModal";
import "./HeroSection.css"; // Adjust the path as necessary

const HeroSection = ({ freelanceAnimationData, scrollY }) => {
  const [loading, setLoading] = useState({ hire: false, freelancer: false });
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientData, setClientData] = useState(null);
  const { currentUser, fetchCurrentUser } = useAuth();
  const skills = [
    "Web Development",
    1500,
    "Mobile Apps",
    1500,
    "UI/UX Design",
    1500,
    "Data Science",
    1500,
    "Digital Marketing",
    1500,
    "Content Creation",
    1500,
  ];

  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: freelanceAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Handle client info save from modal
  const handleSaveClientInfo = async (formData) => {
    try {
      setLoading({ ...loading, hire: true });
      setClientData(formData);
      
      // Update the user's role to 'client'
      const token = localStorage.getItem('token');
      const roleResponse = await axios.put(
        'http://localhost:5000/api/auth/role',
        { role: 'client' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (roleResponse.data.success) {
        // Update role in localStorage
        localStorage.setItem('userRole', 'client');
        
        // Note: The ClientInfoModal component already saves the client profile information
        // so we don't need to duplicate that API call here
        
        // Refresh user data in context
        await fetchCurrentUser();
        
        // Close modal
        setShowClientModal(false);
        
        // Navigate to talent browse page instead of profile
        window.location.href = "/talent/browse";
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update your role. Please try again.');
      setLoading({ ...loading, hire: false });
      return false; // Return false to indicate failure
    }
    
    return true; // Return true to indicate success
  };

  const handleHireClick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn) {
      // Show client info modal instead of immediately updating role
      setShowClientModal(true);
    } else {
      // Redirect to login if not logged in
      window.location.href = "/login";
    }
  };

  const [error, setError] = useState('');
  const handleFreelancerClick = async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn) {
      try {
        setError('');
        setLoading({ ...loading, freelancer: true });
        
        // Call API to update user role to 'freelancer'
        const token = localStorage.getItem('token');
        const response = await axios.put(
          'http://localhost:5000/api/auth/role',
          { role: 'freelancer' },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          // Update role in localStorage
          localStorage.setItem('userRole', 'freelancer');
          
          // Refresh user data in context
          await fetchCurrentUser();
          
          // Navigate to freelancer profile page
          window.location.href = "/personal";
        }
      } catch (error) {
        console.error('Error updating role:', error);
        
        // Handle the case where user can't become a freelancer after being a client
        if (error.response && error.response.status === 403) {
          setError(error.response.data.message || 'You cannot switch to freelancer mode after being a client.');
        } else {
          setError('Failed to update role. Please try again.');
        }
      } finally {
        setLoading({ ...loading, freelancer: false });
      }
    } else {
      // Redirect to login if not logged in
      window.location.href = "/login";
    }
  };

  return (
    <section className="hero">
      <div className="container hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="hero-title">
            Find the Perfect <span className="highlight">Freelancer</span> for
            <div className="typed-text-container">
              <TypeAnimation
                sequence={skills}
                speed={50}
                deletionSpeed={70}
                repeat={Infinity}
                className="typed-text"
                cursor={false}
              />
            </div>
          </h1>
          <p className="hero-subtitle">
            Connect with top talent from around the world to turn your ideas
            into reality.
          </p>
          <div className="hero-cta">
            <motion.button
              className="btn btn-primary btn-large"
              whileHover={!loading.hire ? { scale: 1.05 } : undefined}
              whileTap={!loading.hire ? { scale: 0.95 } : undefined}
              onClick={handleHireClick}
              disabled={loading.hire || loading.freelancer}
            >
              {loading.hire ? 'Setting up...' : 'Hire a Freelancer'}
            </motion.button>
            <motion.button
              className="btn btn-outline btn-large"
              whileHover={!loading.freelancer ? { scale: 1.05 } : undefined}
              whileTap={!loading.freelancer ? { scale: 0.95 } : undefined}
              onClick={handleFreelancerClick}
              disabled={loading.hire || loading.freelancer}
            >
              {loading.freelancer ? 'Setting up...' : 'Become a Freelancer'}
            </motion.button>
          </div>
          
          {/* Error message display */}
          {error && (
            <motion.div 
              className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          <div className="hero-stats">
            {[
              { number: "8M+", label: "Freelancers" },
              { number: "20K+", label: "Companies" },
              { number: "95%", label: "Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                className="stat"
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
              >
                <motion.div
                  className="stat-number"
                  whileInView={{
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.8 },
                  }}
                  viewport={{ once: false, amount: 0.8 }}
                >
                  {stat.number}
                </motion.div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="lottie-animation">
            <Lottie
              options={defaultLottieOptions}
              height={400}
              width={400}
            />
          </div>
          <div className="floating-elements">
            {[
              {
                icon: "💻",
                title: "Web Development",
                price: "from $50/hr",
                offset: 0.1,
                rotate: 0.05,
              },
              {
                icon: "🎨",
                title: "UI/UX Design",
                price: "from $45/hr",
                offset: -0.15,
                rotate: -0.03,
              },
              {
                icon: "📱",
                title: "Mobile Apps",
                price: "from $60/hr",
                offset: 0.08,
                rotate: 0.02,
              },
            ].map((card, index) => (
              <motion.div
                className={`floating-card card-${index + 1}`}
                key={index}
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, card.rotate * 10, 0],
                }}
                transition={{
                  duration: 6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                style={{
                  transform: `translateY(${scrollY * card.offset}px) rotate(${
                    scrollY * card.rotate
                  }deg)`,
                }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
              >
                <div className="card-icon">{card.icon}</div>
                <div className="card-content">
                  <div className="card-title">{card.title}</div>
                  <div className="card-price">{card.price}</div>
                </div>
              </motion.div>
            ))}
            {[1, 2, 3].map((index) => (
              <motion.div
                key={`shape-${index}`}
                className={`floating-shape shape-${index}`}
                animate={{
                  rotate: [0, 360],
                  scale: index % 2 === 0 ? [1, 1.2, 1] : [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 15 + index * 5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
      <div className="hero-wave">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Client Info Modal */}
      {showClientModal && (
        <ClientInfoModal
          onSave={handleSaveClientInfo}
          onClose={() => setShowClientModal(false)}
          existingData={{
            name: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
            phone: '',
            location: '',
            company: '',
            industry: ''
          }}
        />
      )}
    </section>
  );
};

export default HeroSection;