// parallax.js - Эффекты параллакса

document.addEventListener('DOMContentLoaded', () => {
    
    // ======================== ПЕРВЫЙ ПАРАЛЛАКС: движение фона при скролле ========================
    const parallaxBg = document.querySelector('.parallax-bg');
    const parallaxSection = document.querySelector('.parallax-section');
    
    if (parallaxBg && parallaxSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const sectionTop = parallaxSection.offsetTop;
            const sectionHeight = parallaxSection.offsetHeight;
            
            // Рассчитываем позицию секции относительно окна просмотра
            const viewportHeight = window.innerHeight;
            const sectionPosition = sectionTop - scrolled;
            
            // Эффект параллакса для фона (двигается медленнее, чем скролл)
            if (sectionPosition < viewportHeight && sectionPosition + sectionHeight > 0) {
                const speed = 0.5;
                const yPos = -(scrolled - sectionTop) * speed;
                parallaxBg.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
    
    // ======================== ВТОРОЙ ПАРАЛЛАКС: движение карточек за мышью ========================
    const cards = document.querySelectorAll('.parallax-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
    
    // ======================== Эффект параллакса для элементов при скролле (появление с анимацией) ========================
    const fadeElements = document.querySelectorAll('.parallax-card, .parallax-section');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
    
    // ======================== Дополнительный эффект: движение главного баннера при движении мыши ========================
    const heroBlock = document.querySelector('.hero-block');
    const heroImg = document.querySelector('.hero-img');
    
    if (heroBlock && heroImg) {
        heroBlock.addEventListener('mousemove', (e) => {
            const rect = heroBlock.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            const moveX = x * 15;
            const moveY = y * 15;
            
            heroImg.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
        });
        
        heroBlock.addEventListener('mouseleave', () => {
            heroImg.style.transform = 'scale(1) translate(0, 0)';
        });
        
        heroImg.style.transition = 'transform 0.3s ease-out';
    }
});