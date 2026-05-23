document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active-mobile');
        
        // Toggle Icon
        const iconContainer = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active-mobile')) {
            // we'd switch to 'x' but since lucide renders SVGs replacing it dynamically requires a call
            mobileBtn.innerHTML = '<i data-lucide="x"></i>';
        } else {
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
        }
        lucide.createIcons();
    });

    // Close mobile menu when a link is clicked
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active-mobile');
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
    });

    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: Stop observing once revealed
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Dynamic Hover Glow Effect for Service Cards
    const interactables = document.querySelectorAll('.interactable');
    interactables.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const glow = card.querySelector('.service-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(16, 185, 129, 0.15) 0%, transparent 60%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const glow = card.querySelector('.service-glow');
            if (glow) {
                glow.style.background = 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)';
            }
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Handle Form Submit
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Sending... <i data-lucide="loader" class="sm-icon spin"></i>';
            lucide.createIcons();
            
            // Fast simulation of form send
            setTimeout(() => {
                btn.innerHTML = 'Message Sent! <i data-lucide="check" class="sm-icon"></i>';
                btn.style.background = '#10b981';
                lucide.createIcons();
                form.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    lucide.createIcons();
                }, 3000);
            }, 1500);
        });
    }
});
