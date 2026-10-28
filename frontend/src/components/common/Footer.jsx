import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Heart, Check, Send } from 'lucide-react';

export default function Footer() {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribedEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setSubscribedEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="footer-section">
      <div className="container footer-content">
        <div className="footer-grid">
          
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <Shield size={24} className="brand-logo-icon" />
              <span>InternShield <span className="brand-accent">AI</span></span>
            </div>
            <p className="footer-bio">
              Intelligent scam and fraud detection platform safeguarding college students from fake offers, predatory upfront fees, and unverified recruiter networks.
            </p>
            <div className="footer-safety-pill">
              <span className="live-dot" />
              <span>Actively monitoring 2026 campus hiring cycles</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Tools</h4>
            <ul className="footer-links">
              <li><Link to="/scanner">AI Offer Scanner</Link></li>
              <li><Link to="/community">Scam Blacklist Feed</Link></li>
              <li><Link to="/guidelines">Red Flags Checklist</Link></li>
              <li><Link to="/dashboard">Student Dashboard</Link></li>
              <li><Link to="/admin">Admin Moderation</Link></li>
            </ul>
          </div>

          {/* Emergency & Official Portals */}
          <div className="footer-col">
            <h4 className="footer-heading">Official Helplines</h4>
            <ul className="footer-links">
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="external-link">
                  <span>Cyber Crime Portal</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="tel:1930" className="external-link">
                  <span>National Cyber Helpline (1930)</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="https://www.mca.gov.in" target="_blank" rel="noreferrer" className="external-link">
                  <span>MCA Corporate Verification</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="external-link">
                  <span>National Consumer Helpline</span>
                  <ExternalLink size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Scam Alert Newsletter */}
          <div className="footer-col">
            <h4 className="footer-heading">Get Scam Alerts</h4>
            <p className="footer-newsletter-desc">
              Subscribe to weekly reports on newly identified fake companies targeting college students.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="college.email@edu" 
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                {subscribed ? <Check size={16} /> : <Send size={16} />}
              </button>
            </form>
            {subscribed && (
              <p className="subscribe-success">
                ✅ Subscribed to campus threat warnings (Demo mode)
              </p>
            )}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} InternShield AI &bull; Built with passion for College Hackathon 2026.
          </p>
          <div className="footer-bottom-links">
            <span className="demo-badge">All Sample Data Marked as Demo Fixtures</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
