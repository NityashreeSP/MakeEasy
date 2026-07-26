import React from 'react';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      {/* Hero Section with Large Nature Imagery */}
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="travel-pill">
            <span className="pill-icon">🌿</span> Intelligent Travel Companion
          </div>
          <h1 className="hero-title">
            Discover Smarter.<br />
            <span className="gradient-text">Travel Better.</span>
          </h1>
          <p className="hero-subtitle">
            Plan custom itineraries, discover hidden gems, and organize your trips seamlessly—all in one place.
          </p>
          <div className="hero-cta-group">
            <a href="/dashboard" className="btn-primary-large">
              <span>🚀</span> Start Planning Now
            </a>
            <a href="#explore-features" className="btn-secondary-large">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="explore-features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need for your next adventure</h2>
            <p>Designed to make every step of your travel seamless and enjoyable.</p>
          </div>

          <div className="cards-grid">
            <div className="feature-card">
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80" 
                  alt="Trip Planning" 
                  className="card-img"
                />
                <span className="card-badge">Itineraries</span>
              </div>
              <div className="card-body">
                <h3>Custom Trip Builder</h3>
                <p>Generate detailed schedules tailored specifically to your preferences, time, and travel style.</p>
                <a href="/dashboard" className="card-link">Build Itinerary &rarr;</a>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" 
                  alt="Saved Places" 
                  className="card-img"
                />
                <span className="card-badge">Bookmarks</span>
              </div>
              <div className="card-body">
                <h3>Saved Spots & Favorites</h3>
                <p>Keep track of must-visit restaurants, scenic views, and local spots across all your upcoming trips.</p>
                <a href="/saved-places" className="card-link">View Saved Places &rarr;</a>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" 
                  alt="My Trips" 
                  className="card-img"
                />
                <span className="card-badge">Organize</span>
              </div>
              <div className="card-body">
                <h3>All Your Journeys</h3>
                <p>Access your past adventures and upcoming travel itineraries with real-time updates and maps.</p>
                <a href="/my-trips" className="card-link">Explore My Trips &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;