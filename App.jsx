import React, { useEffect, useState, useRef } from 'react';
import Aurora from './React/Background/Aurora';
import MobileBottomNav from './React/GlassSurface/MobileBottomNav';









import ScrollVelocity from './React/textloop/ScrollVelocity';
import {
  Terminal, Menu, X, Smartphone, Globe, Building2, User,
  LayoutTemplate, PenTool, Code2, ExternalLink, CheckCircle,
  Zap, Layout, LifeBuoy, Mail, MapPin, Send, Loader, Check,
  Users, Compass, Award
} from 'lucide-react';
import { FaXTwitter, FaGithub, FaLinkedin, FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import brandLogo from './images/logo.svg';
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, useSpring, AnimatePresence, useAnimationFrame } from 'framer-motion';
import TargetCursor from './React/Cursor/TargetCursor';
import khibraPreview from './images/khibra_preview.png';

// Reusable scroll-aware animated section
function AnimatedSection({ children, variants, className, id, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.section>
  );
}

// Stagger container
function StaggerContainer({ children, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

// Parallax wrapper — element shifts vertically relative to scroll
function ParallaxBox({ children, speed = 0.15, className, style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], [`${-speed * 60}px`, `${speed * 60}px`]);
  const y = useSpring(rawY, { stiffness: 60, damping: 18 });
  return (
    <motion.div ref={ref} className={className} style={{ y, ...style }}>
      {children}
    </motion.div>
  );
}

// Animated divider line that sweeps in on scroll
function RevealLine({ delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #10b981 40%, #00ff87 60%, transparent)',
        marginBottom: '0',
        originX: 0,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={inView ? { scaleX: 1, opacity: 0.6 } : {}}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

// Animation presets — cinematic easing
const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 55, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE } }
};
const fadeDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }
};
const fadeZoom = {
  hidden: { opacity: 0, scale: 0.90, filter: 'blur(8px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.1, ease: EASE } }
};
const slideLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } }
};
const slideRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } }
};
const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } }
};
const clipReveal = {
  hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
  visible: { opacity: 1, clipPath: 'inset(0% 0 0 0)', transition: { duration: 1, ease: EASE } }
};

// Configuration constants
const WHATSAPP_NUMBER = "967735855907"; // Replace with your WhatsApp number (with country code, no + or 00)
const EMAIL_RECIPIENT = "enter.devlop@gmail.com";

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeFilter, setActiveFilter] = useState('الكل');

  const portfolioCategories = ['الكل', 'مواقع الويب', 'تطبيقات الجوال', 'UI/UX'];

  const INITIAL_PROJECTS = [
    {
      id: 1,
      title: 'FinTech Dashboard',
      desc: 'منصة تحليلات حديثة مع تصور للبيانات في الوقت الفعلي ورؤى تقنية عميقة.',
      tags: ['React', 'Node.js'],
      category: 'مواقع الويب',
      bgClass: 'project-1-bg',
      url: 'https://www.khibracontracting.com/'
    },
    {
      id: 2,
      title: 'Lumina E-Commerce',
      desc: 'تجربة تسوق فاخرة عبر الإنترنت مع نظام سلس للدفع وإدارة المنتجات والمخزون.',
      tags: ['Next.js', 'Stripe'],
      category: 'مواقع الويب',
      bgClass: 'project-2-bg',
      url: 'https://www.khibracontracting.com/'
    },
    {
      id: 3,
      title: 'HealthTrack App',
      desc: 'تطبيق محمول متكامل وسهل الاستخدام لتتبع اللياقة الشخصية والعادات الصحية.',
      tags: ['React Native', 'Firebase'],
      category: 'تطبيقات الجوال',
      bgClass: 'project-3-bg',
      url: 'https://www.khibracontracting.com/'
    },
    {
      id: 4,
      title: 'Enter.dev Branding',
      desc: 'هوية بصرية متكاملة تعكس التطور التكنولوجي والاحترافية.',
      tags: ['Figma', 'Illustrator'],
      category: 'UI/UX',
      bgClass: 'project-1-bg',
      url: 'https://www.khibracontracting.com/'
    },
    {
      id: 5,
      title: 'Khibra Contracting',
      desc: 'منصة رقمية رائدة لخدمات المقاولات والإنشاءات الهندسية، تم تطويرها لتقديم حلول إدارة المشاريع الإنشائية والتصميم المعماري المتطور مع تجربة تصفح تفاعلية وفائقة السرعة.',
      tags: ['React.js', 'SEO', 'Cloud'],
      category: 'مواقع الويب',
      bgClass: 'project-5-bg',
      url: 'https://www.khibracontracting.com/',
      image: khibraPreview
    }
  ];

  const [projects, setProjects] = useState(() => {
    const local = localStorage.getItem('enter_dev_projects');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Error parsing local projects database", e);
      }
    }
    return INITIAL_PROJECTS;
  });

  // Dynamic mounting fetch for Supabase Cloud DB
  useEffect(() => {
    async function loadCloudProjects() {
      try {
        const { isSupabaseActive, fetchCloudProjects } = await import('./React/Admin/supabaseService');
        if (isSupabaseActive()) {
          const cloudList = await fetchCloudProjects();
          if (cloudList && cloudList.length > 0) {
            setProjects(cloudList);
            localStorage.setItem('enter_dev_projects', JSON.stringify(cloudList));
          }
        }
      } catch (error) {
        console.error("Failed to load projects from cloud database on startup:", error);
      }
    }
    loadCloudProjects();
  }, []);





  const filteredProjects = projects.filter(project =>
    activeFilter === 'الكل' || project.category === activeFilter
  );

  const interactablesRef = useRef([]);
  const formRef = useRef(null);

  // 3D Interactive Robot State
  const robotMouseX = useMotionValue(0);
  const robotMouseY = useMotionValue(0);

  const robotSpringConfig = { stiffness: 120, damping: 22, mass: 0.5 };
  const robotRotateX = useSpring(useTransform(robotMouseY, [-150, 150], [12, -12]), robotSpringConfig);
  const robotRotateY = useSpring(useTransform(robotMouseX, [-150, 150], [-12, 12]), robotSpringConfig);

  const robotFaceX = useSpring(useTransform(robotMouseX, [-150, 150], [-6, 6]), robotSpringConfig);
  const robotFaceY = useSpring(useTransform(robotMouseY, [-150, 150], [-4, 4]), robotSpringConfig);

  const robotLeftArmX = useSpring(useTransform(robotMouseX, [-150, 150], [-8, 2]), robotSpringConfig);
  const robotRightArmX = useSpring(useTransform(robotMouseX, [-150, 150], [-2, 8]), robotSpringConfig);
  const robotArmY = useSpring(useTransform(robotMouseY, [-150, 150], [-3, 3]), robotSpringConfig);

  const robotShadowScale = useSpring(useTransform(robotMouseY, [-150, 150], [0.92, 1.08]), robotSpringConfig);

  const handleRobotMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    robotMouseX.set(x);
    robotMouseY.set(y);
  };

  const handleRobotMouseLeave = () => {
    robotMouseX.set(0);
    robotMouseY.set(0);
  };

  // Infinite Carousel State
  const dragX = useMotionValue(0);
  const carouselMeasureRef = useRef(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  useAnimationFrame((t, delta) => {
    if (carouselWidth === 0 || isHoveringCarousel) return;

    // Smooth auto-scroll right to left
    // -0.5 velocity is slow and elegant
    const moveBy = -0.5 * (delta / 16);
    dragX.set(dragX.get() + moveBy);
  });

  useEffect(() => {
    const updateWidth = () => {
      if (carouselMeasureRef.current) {
        // Measure the width of one complete set of 4 cards including gaps
        setCarouselWidth(carouselMeasureRef.current.offsetWidth + 32); // 32px is the 2rem gap between sets
      }
    };
    updateWidth();
    setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const wrap = (min, max, v) => {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  };

  const offsetX = useTransform(dragX, (v) => {
    if (carouselWidth === 0) return '0px';
    const wrapped = wrap(carouselWidth, carouselWidth * 2, v);
    // The parent moves by `v`. We want the child's screen position to be `wrapped`.
    // So the child's local offset must be `wrapped - v`.
    return `${wrapped - v}px`;
  });

  // Handle scroll events for navbar and active links
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id');
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Scroll Reveal
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    return () => {
      revealElements.forEach(el => revealObserver.unobserve(el));
    }
  }, []);

  const handleInteractableMouseMove = (e, index) => {
    const card = interactablesRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate 3D tilt (curve effect)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    const glow = card.querySelector('.service-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(16, 185, 129, 0.25) 0%, transparent 70%)`;
      glow.style.opacity = '1';
    }
  };

  const handleInteractableMouseLeave = (index) => {
    const card = interactablesRef.current[index];
    if (!card) return;

    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

    const glow = card.querySelector('.service-glow');
    if (glow) {
      glow.style.background = 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)';
      glow.style.opacity = '0';
    }
  };

  const handleWhatsAppSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const text = `مرحباً enter.dev، أود الاستفسار عن خدماتكم البرمجية لبدء مشروعي الجديد.`;
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleEmailSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const subject = encodeURIComponent("استفسار عن تطوير مشروع جديد | enter.dev");
    const body = encodeURIComponent("مرحباً enter.dev،\n\nأود الاستفسار عن تفاصيل تطوير مشروع برمجيات جديد معكم وكيف يمكننا البدء بالعمل.\n\nمع خالص التحية،");
    const url = `mailto:${EMAIL_RECIPIENT}?subject=${subject}&body=${body}`;
    window.location.href = url;
  };



  return (
    <div className="app-wrapper" style={{ overflowX: 'hidden', width: '100%', minHeight: '100vh', position: 'relative' }}>
      <TargetCursor targetSelector="a, button, .service-card, .portfolio-item, .glass-panel" spinDuration={3} hideDefaultCursor={true} />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <Aurora colorStops={["#064e3b", "#10b981", "#059669"]} amplitude={1.2} blend={0.6} />
      </div>

      <div className="grid-overlay"></div>

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <a
            href="#home"
            className="logo cursor-target"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src={brandLogo} alt="Enter.dev Logo" className="brand-logo" />
          </a>

          <ul className={`nav-links ${mobileMenuOpen ? 'active-mobile' : ''}`}>
            <li><a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>من نحن</a></li>
            <li><a href="#services" className={`nav-link ${activeSection === 'services' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>خدماتنا</a></li>
            <li><a href="#portfolio" className={`nav-link ${activeSection === 'portfolio' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>أعمالنا</a></li>
            <li><a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>تواصل معنا</a></li>
          </ul>

          <a href="#contact" className="btn btn-outline cursor-target" style={{ display: mobileMenuOpen ? 'none' : 'inline-flex' }}>لنتحدث</a>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <AnimatedSection variants={fadeZoom} className="hero" id="home">
          <div className="container hero-container">
            <motion.div className="hero-content" initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div className="badge" variants={fadeDown}>
                <span className="pulse-dot"></span> وكالة برمجيات من الجيل القادم
              </motion.div>
              <motion.h1 variants={clipReveal}>
                نبني <span className="gradient-text">تجارب رقمية</span> تصنع الفارق
              </motion.h1>
              <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
                enter.dev هي شركة برمجيات ذات رؤية مستقبلية متخصصة في حلول الويب، تطبيقات الهواتف المحمولة، والحلول الرقمية المخصصة والمبتكرة المصممة لتسريع نموك.
              </motion.p>
              <motion.div className="hero-buttons" variants={fadeUp}>
                <a href="#portfolio" className="btn btn-primary">شاهد أعمالنا</a>
                <a href="#contact" className="btn btn-secondary">ابدأ مشروعك</a>
              </motion.div>
            </motion.div>

            <ParallaxBox speed={0.12} style={{ display: 'contents' }}>
              <motion.div className="hero-visual" variants={slideRight} initial="hidden" animate="visible" transition={{ delay: 0.2, duration: 1 }}>
                <div className="glass-card visual-card main-card">
                  <div className="card-header" dir="ltr">
                    <div className="dots"><span></span><span></span><span></span></div>
                  </div>
                  <div className="card-body" dir="ltr">
                    <div className="code-line w-80"></div>
                    <div className="code-line w-60"></div>
                    <div className="code-line w-90"></div>
                    <br />
                    <div className="code-line w-40 indent"></div>
                    <div className="code-line w-70 indent"></div>
                    <div className="code-line w-50 indent"></div>
                  </div>
                </div>
                <div className="glass-card visual-card float-card-1">
                  <Smartphone size={32} className="lg-icon" />
                  <span>تطبيقات الجوال</span>
                </div>
                <div className="glass-card visual-card float-card-2">
                  <Globe size={32} className="lg-icon" />
                  <span>تطبيقات الويب</span>
                </div>
              </motion.div>
            </ParallaxBox>
          </div>
        </AnimatedSection>

        <motion.div
          className="hero-text-loop-wrapper"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          dir="ltr"
        >
          <ScrollVelocity
            texts={[
              'enter a new era',
              'إنتر حقبة جديدة'
            ]}
            velocity={50}
            numCopies={20}
            className="scroll-text-custom"
          />
        </motion.div>

        {/* About Section */}
        <AnimatedSection variants={fadeUp} className="about section" id="about">
          <RevealLine />
          <div className="container">
            <div className="about-grid">
              {/* Info Panel (Text, Slogan, and Stats Counter) */}
              <motion.div className="about-info" variants={slideLeft}>
                <div className="tech-badge">
                  <span className="pulse-dot"></span>
                  منصة برمجية متكاملة • enter.dev
                </div>
                <h2>نبني حقبة جديدة من <br /><span className="gradient-text">التميز الهندسي</span></h2>
                <p>
                  في <strong>enter.dev</strong>، نحن لا نكتفي بكتابة الكود؛ بل نصمم بنية تحتية رقمية وتجارب متكاملة تواكب متطلبات المستقبل. ندمج الابتكار البرمجي والذكاء الاصطناعي مع التصاميم العصرية فائقة الدقة لنمنح عملائنا ميزة تنافسية لا تضاهى في السوق الرقمي المتسارع.
                </p>

                <div className="about-stats">
                  <div className="stat-item">
                    <span className="stat-number">99%+</span>
                    <span className="stat-label">نسبة رضا وثقة العملاء</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">أداء وكفاءة البنية البرمجية</span>
                  </div>
                </div>
              </motion.div>

              {/* Pillars Cards Grid (SaaS-Style Interactive Cards) */}
              <motion.div className="pillars-grid" variants={slideRight}>
                {/* Pillar 1: Who We Are & Our Team (Spans full width on desktop) */}
                <div className="pillar-card glass-panel cursor-target">
                  <div className="pillar-glow"></div>
                  <div className="pillar-icon-wrapper">
                    <Users size={24} />
                  </div>
                  <div className="pillar-content">
                    <h3>فريقنا وخبرتنا</h3>
                    <p>فريق متكامل ومتعاون من المهندسين الشغوفين، المصممين المبدعين، وخبراء الأنظمة السحابية والذكاء الاصطناعي. نجمع بين أحدث منهجيات العمل المرنة والتصاميم الراقية لنبني حلولاً برمجية متماسكة تحقق أهدافك وتتفوق على التوقعات.</p>
                  </div>
                </div>

                {/* Pillar 2: Technical Vision */}
                <div className="pillar-card glass-panel cursor-target">
                  <div className="pillar-glow"></div>
                  <div className="pillar-icon-wrapper">
                    <Compass size={24} />
                  </div>
                  <div className="pillar-content">
                    <h3>رؤيتنا التقنية</h3>
                    <p>أن نكون الشريك التقني الملهم والدافع للتحول الرقمي للشركات الطموحة بتمكينها من بنيات برمجية مرنة وقابلة للتوسع تواكب التطور السريع وتخدم أهداف التوسع المستقبلي.</p>
                  </div>
                </div>

                {/* Pillar 3: Core Values & Strengths */}
                <div className="pillar-card glass-panel cursor-target">
                  <div className="pillar-glow"></div>
                  <div className="pillar-icon-wrapper">
                    <Award size={24} />
                  </div>
                  <div className="pillar-content">
                    <h3>قيمنا وقوتنا</h3>
                    <p>نلتزم بالجودة البرمجية المطلقة، الشفافية التامة، والتطوير المستمر. كل تطبيق نصنعه يمر باختبارات صارمة لضمان سرعة فائقة، حماية متكاملة وتجربة مستخدم مبهرة.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection variants={fadeUp} className="services section" id="services">
          <RevealLine delay={0.1} />
          <div className="container">
            <motion.div className="section-header" variants={fadeUp}>
              <h2 className="section-title"><span className="gradient-text">خدماتنا</span></h2>
              <p className="section-subtitle">نحول الأفكار إلى منتجات رقمية قوية وجاهزة للمنافسة في السوق.</p>
            </motion.div>

            <div
              className="services-carousel-wrapper"
              style={{ overflow: 'hidden', padding: '1rem 0', width: '100%' }}
              onMouseEnter={() => setIsHoveringCarousel(true)}
              onMouseLeave={() => setIsHoveringCarousel(false)}
              onPointerDown={() => setIsHoveringCarousel(true)}
              onPointerUp={() => setIsHoveringCarousel(false)}
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: -1000000, right: 1000000 }} // Infinite drag space
                dragElastic={0}
                dragMomentum={true}
                style={{ x: dragX, cursor: "grab" }}
                whileTap={{ cursor: "grabbing" }}
              >
                <motion.div
                  className="services-carousel"
                  style={{ x: offsetX, display: 'flex', gap: '2rem', width: 'max-content' }}
                >
                  {[0, 1, 2, 3].map((setIndex) => (
                    <div
                      key={`set-${setIndex}`}
                      ref={setIndex === 0 ? carouselMeasureRef : null}
                      style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}
                    >
                      {[
                        { icon: LayoutTemplate, title: "تطوير الويب", desc: "مواقع وتطبيقات ويب سريعة، متجاوبة ومحسنة لمحركات البحث مبنية بأحدث إطارات العمل.", delay: "" },
                        { icon: Smartphone, title: "تطبيقات الجوال", desc: "تطبيقات أصلية أو متقاطعة المنصات تقدم تجارب سلسة ومتميزة على أجهزة iOS و Android.", delay: "delay-1" },
                        { icon: PenTool, title: "تصميم UI/UX", desc: "واجهات مذهلة بصرياً تركز على راحة المستخدم لتعزيز تفاعله والارتقاء بهوية علامتك.", delay: "delay-2" },
                        { icon: Code2, title: "برمجيات مخصصة", desc: "حلول برمجية مصممة خصيصاً لتبسيط العمليات الإدارية، والتوسع مع نمو أعمالك بنجاح.", delay: "delay-3" }
                      ].map((service, index) => {
                        // Assign to interactablesRef only for the first set so it doesn't overflow refs
                        const globalIndex = setIndex * 4 + index;
                        return (
                          <motion.div
                            key={`card-${globalIndex}`}
                            className="service-card glass-panel interactable"
                            ref={el => interactablesRef.current[globalIndex] = el}
                            onMouseMove={(e) => handleInteractableMouseMove(e, globalIndex)}
                            onMouseLeave={() => handleInteractableMouseLeave(globalIndex)}
                            variants={cardReveal}
                            style={{ transition: 'transform 0.1s ease-out' }}
                          >
                            <div className="service-glow" style={{ transition: 'opacity 0.3s' }}></div>
                            <div className="service-icon">
                              <service.icon size={24} />
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.desc}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* Portfolio Section */}
        <AnimatedSection variants={fadeUp} className="portfolio section" id="portfolio">
          <RevealLine delay={0.1} />
          <div className="container">
            <motion.div className="section-header" variants={fadeUp}>
              <h2 className="section-title">معرض <span className="gradient-text">أعمالنا</span></h2>
              <p className="section-subtitle">لمحة عن بعض ابتكاراتنا ومشاريعنا الرقمية الأخيرة.</p>
            </motion.div>

            <motion.div className="portfolio-filters" variants={fadeUp}>
              {portfolioCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            <motion.div layout className="portfolio-grid">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="portfolio-card"
                    key={project.id}
                    whileHover={{ y: -10, transition: { duration: 0.25 } }}
                  >
                    <div className="portfolio-img-wrapper">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="img-placeholder"
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <div className={`img-placeholder ${project.bgClass || 'project-5-bg'}`}></div>
                      )}
                      <div className="portfolio-overlay">
                        <a
                          href={project.url || "https://www.khibracontracting.com/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-cta-btn primary"
                        >
                          <ExternalLink size={14} />
                          <span>زيارة الموقع</span>
                        </a>

                      </div>
                    </div>
                    <div className="portfolio-info">
                      <h3 dir="ltr" style={{ textAlign: 'right' }}>{project.title}</h3>
                      <p>{project.desc}</p>
                      <div className="tags" dir="ltr" style={{ justifyContent: 'flex-end' }}>
                        {project.tags.map(tag => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Why Choose Us Section */}
        <AnimatedSection variants={fadeUp} className="why-us section">
          <RevealLine delay={0.1} />
          <div className="container">
            <motion.div className="why-us-content glass-panel" variants={fadeZoom}>
              <div className="why-us-text">
                <h2 className="section-title">لماذا تختار <span className="gradient-text" dir="ltr">enter.dev</span></h2>
                <p>نحن نفخر بتقديم جودة لا مساومة فيها مع التركيز الدائم الموثوق على السرعة والابتكار.</p>

                <StaggerContainer className="features-list" style={{ listStyle: 'none', padding: 0 }}>
                  {[
                    { icon: CheckCircle, title: 'عمل عالي الجودة', desc: 'تصاميم خالية من العيوب وبنية برمجية قوية وذكية.' },
                    { icon: Zap, title: 'تسليم سريع', desc: 'منهجيات مرنة وأجايل تضمن إنجاز العمل وعكس التغييرات بسرعة.' },
                    { icon: Layout, title: 'نهج تصميم حديث', desc: 'مواكبة أحدث صيحات تصميم واجهة وتجربة المستخدم (UI/UX).' },
                    { icon: LifeBuoy, title: 'دعم مستمر', desc: 'صيانة موثوقة وتحديثات دورية مباشرة بعد الإطلاق.' },
                  ].map(({ icon: Icon, title, desc }, i) => (
                    <motion.li key={i} variants={slideLeft}>
                      <div className="feature-icon"><Icon size={24} /></div>
                      <div><h4>{title}</h4><p>{desc}</p></div>
                    </motion.li>
                  ))}
                </StaggerContainer>
              </div>
              <ParallaxBox speed={-0.08} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div
                  className="why-us-visual"
                  onMouseMove={handleRobotMouseMove}
                  onMouseLeave={handleRobotMouseLeave}
                  style={{ position: 'relative', width: '100%', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {/* Soft Background Pulse Glow */}
                  <div className="robot-bg-glow"></div>

                  {/* Concentric Wireframe Orbital Rings & Glowing Particles */}
                  <div className="robot-orbitals">
                    <svg width="360" height="360" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0 }}>
                      {/* Orbital Ring 1 (Inner) */}
                      <circle cx="180" cy="180" r="110" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Orbital Ring 2 (Middle) */}
                      <circle cx="180" cy="180" r="140" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1.5" />

                      {/* Orbital Ring 3 (Outer) */}
                      <circle cx="180" cy="180" r="170" stroke="rgba(16, 185, 129, 0.04)" strokeWidth="1" />
                    </svg>

                    {/* Floating Glowing Particle Dots */}
                    <motion.div
                      className="orbital-particle p1"
                      animate={{
                        x: [110, 250, 110],
                        y: [60, 300, 60],
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.3, 0.9, 0.3]
                      }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="orbital-particle p2"
                      animate={{
                        x: [250, 70, 250],
                        y: [120, 240, 120],
                        scale: [1.2, 0.7, 1.2],
                        opacity: [0.8, 0.2, 0.8]
                      }}
                      transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="orbital-particle p3"
                      animate={{
                        x: [180, 290, 70, 180],
                        y: [40, 180, 180, 40],
                        scale: [0.9, 1.1, 0.9, 0.9],
                        opacity: [0.4, 0.8, 0.4, 0.4]
                      }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  {/* Circular Translucent Green Shield (Reference Style) */}
                  <motion.div
                    className="robot-glass-disk"
                    animate={{
                      scale: [0.98, 1.02],
                      rotate: [0, 360]
                    }}
                    transition={{
                      scale: { duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                      rotate: { duration: 45, repeat: Infinity, ease: "linear" }
                    }}
                  />

                  {/* Ground Puddle Glow (Green accent bottom casting) */}
                  <motion.div
                    className="robot-ground-glow"
                    animate={{
                      scale: [0.85, 1.15],
                      opacity: [0.45, 0.8]
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />

                  {/* Ground Static Black Shadow */}
                  <motion.div
                    className="robot-shadow"
                    animate={{
                      scale: [0.88, 1.12],
                      opacity: [0.4, 0.7]
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />

                  {/* Floating Robot Body & Head */}
                  <motion.div
                    className="robot-container"
                    animate={{ y: [-8, 8] }}
                    transition={{
                      y: {
                        duration: 3.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: '240px',
                      height: '280px',
                      transformStyle: 'preserve-3d',
                      perspective: 1000,
                      zIndex: 2
                    }}
                  >
                    {/* Left Floating Arm */}
                    <div className="robot-arm-left-wrapper">
                      <motion.div
                        className="robot-arm"
                        style={{ x: robotLeftArmX, y: robotArmY }}
                      >
                        <svg width="32" height="70" viewBox="0 0 32 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, direction: 'ltr' }}>
                          {/* Glowing Cybernetic Shoulder Joint */}
                          <rect x="14" y="16" width="18" height="8" rx="3" fill="#1c2d28" stroke="#00ff87" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 135, 0.4))' }} />
                          {/* White Glossy Arm Upper/Mid-section */}
                          <rect width="22" height="50" rx="11" fill="url(#armGradient)" transform="translate(5, 5)" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
                          {/* Black Lower Joint/Hand */}
                          <circle cx="16" cy="54" r="7" fill="#0f1715" stroke="#1c2d28" strokeWidth="1.5" />
                          <circle cx="16" cy="54" r="2.5" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 2px #00ff87)' }} />
                          <defs>
                            <radialGradient id="armGradient" cx="30%" cy="30%" r="70%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="60%" stopColor="#e2e8f0" />
                              <stop offset="100%" stopColor="#cbd5e1" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </motion.div>
                    </div>

                    {/* Torso (Body) */}
                    <div className="robot-body-wrapper">
                      <motion.div
                        className="robot-body"
                        style={{ rotateX: robotRotateX, rotateY: robotRotateY }}
                      >
                        <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, direction: 'ltr' }}>
                          {/* Glowing Cybernetic Neck Joint */}
                          <rect x="42" y="2" width="16" height="12" rx="2" fill="#1c2d28" stroke="#00ff87" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 135, 0.4))' }} />
                          {/* Perfect tapered glossy capsule body path */}
                          <path d="M 12,30 C 12,14 88,14 88,30 C 88,60 76,86 50,86 C 24,86 12,60 12,30 Z" fill="url(#bodyGradient)" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }} />

                          {/* White gloss body highlight */}
                          <path d="M 22,28 C 22,20 40,16 50,16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.45" />

                          {/* Chest Badge: Rounded rectangle with glowing green border and ">_" terminal text */}
                          <rect x="36" y="24" width="28" height="22" rx="6" fill="#0b1712" stroke="#00ff87" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 135, 0.4))' }} />
                          <text
                            x="50"
                            y="38"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#00ff87"
                            fontSize="12"
                            fontFamily="monospace"
                            fontWeight="bold"
                            style={{ filter: 'drop-shadow(0 0 3px #00ff87)', direction: 'ltr' }}
                          >
                            &gt;_
                          </text>

                          <defs>
                            <radialGradient id="bodyGradient" cx="35%" cy="30%" r="65%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="70%" stopColor="#e2e8f0" />
                              <stop offset="100%" stopColor="#cbd5e1" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </motion.div>
                    </div>

                    {/* Right Floating Arm */}
                    <div className="robot-arm-right-wrapper">
                      <motion.div
                        className="robot-arm"
                        style={{ x: robotRightArmX, y: robotArmY }}
                      >
                        <svg width="32" height="70" viewBox="0 0 32 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, direction: 'ltr' }}>
                          {/* Glowing Cybernetic Shoulder Joint */}
                          <rect x="0" y="16" width="18" height="8" rx="3" fill="#1c2d28" stroke="#00ff87" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 135, 0.4))' }} />
                          {/* White Glossy Arm Upper/Mid-section */}
                          <rect width="22" height="50" rx="11" fill="url(#armGradient2)" transform="translate(5, 5)" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
                          {/* Black Lower Joint/Hand */}
                          <circle cx="16" cy="54" r="7" fill="#0f1715" stroke="#1c2d28" strokeWidth="1.5" />
                          <circle cx="16" cy="54" r="2.5" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 2px #00ff87)' }} />
                          <defs>
                            <radialGradient id="armGradient2" cx="30%" cy="30%" r="70%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="60%" stopColor="#e2e8f0" />
                              <stop offset="100%" stopColor="#cbd5e1" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </motion.div>
                    </div>

                    {/* Head (with Face Screen parallax) */}
                    <div className="robot-head-wrapper">
                      <motion.div
                        className="robot-head"
                        style={{
                          rotateX: robotRotateX,
                          rotateY: robotRotateY,
                          transformStyle: 'preserve-3d',
                          zIndex: 10
                        }}
                      >
                        {/* Master Head Sphere SVG */}
                        <svg width="150" height="130" viewBox="0 0 150 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, direction: 'ltr' }}>
                          <ellipse cx="75" cy="65" rx="72" ry="60" fill="url(#headGradient)" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }} />

                          {/* Glossy White Ears with Inner Glowing Green Rings */}
                          {/* Left Ear */}
                          <ellipse cx="4" cy="65" rx="4" ry="15" fill="url(#headGradient)" stroke="#cbd5e1" />
                          <ellipse cx="2" cy="65" rx="2" ry="10" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 4px #00ff87)' }} />

                          {/* Right Ear */}
                          <ellipse cx="146" cy="65" rx="4" ry="15" fill="url(#headGradient)" stroke="#cbd5e1" />
                          <ellipse cx="148" cy="65" rx="2" ry="10" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 4px #00ff87)' }} />

                          <defs>
                            <radialGradient id="headGradient" cx="30%" cy="30%" r="70%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="65%" stopColor="#f1f5f9" />
                              <stop offset="100%" stopColor="#cbd5e1" />
                            </radialGradient>
                          </defs>
                        </svg>

                        {/* Floating Face Plate (recessed inside head for parallax depth) */}
                        <motion.div
                          className="robot-face-plate"
                          style={{ x: robotFaceX, y: robotFaceY, z: 20 }}
                        >
                          <svg width="106" height="74" viewBox="0 0 106 74" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ direction: 'ltr' }}>
                            {/* Face Screen */}
                            <rect x="2" y="2" width="102" height="70" rx="28" fill="url(#facePlateGradient)" stroke="#10b981" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.2))' }} />

                            {/* Glowing Eyes (Large ovular shape per reference image) */}
                            {/* Left Eye */}
                            <ellipse cx="32" cy="37" rx="12" ry="12" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 8px #00ff87)' }} />
                            <ellipse cx="32" cy="37" rx="12" ry="12" fill="url(#scanlines)" />

                            {/* Right Eye */}
                            <ellipse cx="74" cy="37" rx="12" ry="12" fill="#00ff87" style={{ filter: 'drop-shadow(0 0 8px #00ff87)' }} />
                            <ellipse cx="74" cy="37" rx="12" ry="12" fill="url(#scanlines)" />

                            {/* High-gloss curved glass reflection overlay */}
                            <path d="M 6,37 A 47,31 0 0,1 100,37 A 47,20 0 0,0 6,37 Z" fill="#ffffff" fillOpacity="0.08" />

                            <defs>
                              <linearGradient id="facePlateGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#141c19" />
                                <stop offset="100%" stopColor="#080e0c" />
                              </linearGradient>

                              {/* Horizontal Scanline Pattern */}
                              <pattern id="scanlines" width="100" height="4" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="100" y2="0" stroke="#000000" strokeWidth="1.2" strokeOpacity="0.35" />
                              </pattern>
                            </defs>
                          </svg>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </ParallaxBox>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection variants={fadeUp} className="contact section" id="contact">
          <RevealLine delay={0.1} />
          <div className="container">
            <div className="contact-grid">
              <motion.div className="contact-info" variants={slideLeft}>
                <h2 className="section-title"><span className="gradient-text">لنتحدث </span>الآن</h2>
                <p>هل أنت مستعد لبدء مشروعك الكبير القادم؟ تواصل معنا ولنبني شيئاً رقمياً استثنائياً معاً بكل شغف وحب.</p>

                <div className="contact-methods">
                  <a href={`mailto:${EMAIL_RECIPIENT}`} className="method cursor-target" dir="ltr" style={{ justifyContent: 'flex-end', textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                    <span>{EMAIL_RECIPIENT}</span>
                    <Mail size={24} className="feature-icon" />
                  </a>
                  <div className="method">
                    <MapPin size={24} className="feature-icon" />
                    <span>العمل عن بُعد • حول العالم</span>
                  </div>
                </div>
              </motion.div>

              <motion.div className="contact-form-wrapper glass-panel" variants={slideRight} style={{ padding: '2rem' }}>
                <div className="contact-cards-wrapper">
                  <div className="contact-card-header">
                    <span className="badge response-badge">
                      <span className="pulse-dot"></span> متصلون الآن • استجابة فورية
                    </span>
                    <h3>قنوات التواصل المباشرة</h3>
                    <p>اختر الوسيلة المفضلة لديك وسنقوم بالرد عليك فوراً لبدء مشروعك الكبير القادم.</p>
                  </div>

                  <div className="contact-options-grid">
                    {/* WhatsApp Card */}
                    <div className="contact-option-card glass-panel cursor-target" onClick={handleWhatsAppSubmit}>
                      <div className="option-glow"></div>
                      <div className="option-icon-wrapper whatsapp-icon-bg">
                        <FaWhatsapp size={28} />
                      </div>
                      <div className="option-info">
                        <h4>المحادثة المباشرة</h4>
                        <p>مناقشة تفاصيل الفكرة والبدء سريعاً عبر محادثة واتساب فورية.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-whatsapp w-full"
                        onClick={(e) => handleWhatsAppSubmit(e)}
                      >
                        تواصل عبر الواتساب
                      </button>
                    </div>

                    {/* Email Card */}
                    <div className="contact-option-card glass-panel cursor-target" onClick={handleEmailSubmit}>
                      <div className="option-glow"></div>
                      <div className="option-icon-wrapper email-icon-bg">
                        <Mail size={28} />
                      </div>
                      <div className="option-info">
                        <h4>البريد الإلكتروني</h4>
                        <p>أرسل متطلبات مشروعك بالتفصيل وسنجيبك خلال 24 ساعة عمل.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-email w-full"
                        onClick={(e) => handleEmailSubmit(e)}
                      >
                        تواصل عبر البريد
                      </button>
                    </div>
                  </div>

                  <div className="contact-card-footer">
                    <p>أو تفضل بزيارة <a href="#portfolio" className="gradient-text" style={{ fontWeight: '700' }}>معرض أعمالنا</a> لرؤية مشاريعنا السابقة.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>



      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand-section">
              <a href="/" className="logo">
                <img src={brandLogo} alt="Enter.dev Logo" className="brand-logo" />
              </a>
              <p className="footer-tagline">نبني الجيل القادم من التجارب الرقمية.</p>
              <p className="footer-desc">نحن في enter.dev نصنع حلولاً تقنية متقدمة تجمع بين التصميم المذهل والأداء الفائق لمساعدة أعمالك على النمو.</p>
            </div>

            {/* Navigation Links */}
            <div className="footer-links-section">
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="#home">الرئيسية</a></li>
                <li><a href="#about">من نحن</a></li>
                <li><a href="#services">الخدمات</a></li>
                <li><a href="#portfolio">أعمالنا</a></li>
                <li><a href="#contact">تواصل معنا</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-links-section">
              <h4>خدماتنا</h4>
              <ul>
                <li><a href="#">تطوير مواقع الويب</a></li>
                <li><a href="#">تطبيقات الجوال</a></li>
                <li><a href="#">تصميم واجهة المستخدم UI/UX</a></li>
                <li><a href="#">حلول برمجية مخصصة</a></li>
              </ul>
            </div>

            {/* Contact & Socials */}
            <div className="footer-contact-section">
              <h4>تواصل معنا</h4>
              <ul className="footer-contact-info">
                <li>
                  <a href={`mailto:${EMAIL_RECIPIENT}`} className="cursor-target" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <Mail size={16} style={{ color: 'var(--neon-green)' }} />
                    <span dir="ltr">{EMAIL_RECIPIENT}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً enter.dev، أود الاستفسار عن خدماتكم البرمجية لبدء مشروعي الجديد.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-target"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    <FaWhatsapp size={16} style={{ color: '#25D366' }} />
                    <span dir="ltr">+{WHATSAPP_NUMBER}</span>
                  </a>
                </li>
                <li><MapPin size={16} /> العمل عن بُعد • حول العالم</li>
              </ul>
              <div className="footer-socials" dir="ltr">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً enter.dev، أود الاستفسار عن خدماتكم البرمجية لبدء مشروعي الجديد.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="cursor-target"
                >
                  <FaWhatsapp size={18} />
                </a>
                <a href="https://www.instagram.com/enter.dev?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" aria-label="Instagram"><FaInstagram size={18} /></a>
              </div>
            </div>
          </div>

          <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p>&copy; {new Date().getFullYear()} enter.dev. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      <MobileBottomNav activeSection={activeSection} />
    </div>
  );
}

export default App;
