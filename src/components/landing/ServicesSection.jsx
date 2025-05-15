import React, { forwardRef } from 'react';

const ServicesSection = forwardRef((props, ref) => {
  return (
    <section ref={ref} className="services-section">
      <h2>Our Services</h2>
      <p>Explore the wide range of services we offer to help you achieve your goals.</p>
      {/* Add more content or components here */}
    </section>
  );
});

export default ServicesSection;