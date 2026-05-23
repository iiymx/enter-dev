import { motion, AnimatePresence } from 'framer-motion';
import GlassSurface from './GlassSurface';
import './MobileBottomNav.css';

// SVG Icons ported perfectly with exactly matching stroke settings
const HomeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const AboutIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ServicesIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ContactIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MobileBottomNav = ({ activeSection }) => {
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: HomeIcon },
    { id: 'about', label: 'من نحن', icon: AboutIcon },
    { id: 'services', label: 'خدماتنا', icon: ServicesIcon },
    { id: 'portfolio', label: 'أعمالنا', icon: PortfolioIcon },
    { id: 'contact', label: 'تواصل معنا', icon: ContactIcon },
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="glass-nav-wrapper">
      <GlassSurface
        width="100%"
        height={70}
        borderRadius={35}
        brightness={60}
        opacity={0.9}
        blur={14}
        distortionScale={-180}
        greenOffset={10}
        blueOffset={20}
        backgroundOpacity={0.10}
        saturation={1.6}
        mixBlendMode="difference"
        className="glass-bottom-nav"
      >
        <div className="glass-nav-items-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`glass-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                <div className="glass-nav-icon-wrapper">
                  <Icon />
                </div>
                <span>{item.label}</span>
                
                {/* Framer Motion Liquid Active Indicator Dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="glass-nav-active-dot"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </AnimatePresence>
              </a>
            );
          })}
        </div>
      </GlassSurface>
    </div>
  );
};

export default MobileBottomNav;
