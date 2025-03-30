// animations.js - Script para inicializar animações na página

// Função para inicializar as animações na página
export const initAnimations = () => {
    // Contador para os números estatísticos
    const initCounters = () => {
      const counters = document.querySelectorAll('.counter');
      
      counters.forEach(counter => {
        const target = parseInt(counter.closest('.stat-number').getAttribute('data-count'));
        const duration = 2000; // 2 segundos
        const step = Math.ceil(target / (duration / 20)); // Atualiza a cada 20ms
        let current = 0;
        
        const updateCounter = () => {
          current += step;
          if (current > target) current = target;
          counter.textContent = current;
          
          if (current < target) {
            setTimeout(updateCounter, 20);
          }
        };
        
        // Inicia o contador quando o elemento estiver visível
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            updateCounter();
            observer.disconnect();
          }
        }, { threshold: 0.5 });
        
        observer.observe(counter.closest('.stat-item'));
      });
    };
    
    // Adiciona classe ao header no scroll
    const initScrollEffects = () => {
      const handleScroll = () => {
        if (window.scrollY > 100) {
          document.body.classList.add('scrolled');
        } else {
          document.body.classList.remove('scrolled');
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    };
    
    // Efeito de formulário com foco
    const initFormEffects = () => {
      const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
      
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
          if (!input.value) {
            input.parentElement.classList.remove('focused');
          }
        });
      });
    };
    
    // Inicializa o carrossel de depoimentos
    const initTestimonialSlider = () => {
      const slider = document.querySelector('.testimonial-slider');
      if (!slider) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;
      
      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
      });
      
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
      });
      
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade do scroll
        slider.scrollLeft = scrollLeft - walk;
      });
    };
    
    // Inicializa todos os efeitos
    // Aguarda o DOM estar completamente carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initCounters();
        initFormEffects();
        initTestimonialSlider();
      });
    } else {
      initCounters();
      initFormEffects();
      initTestimonialSlider();
    }
    
    // Inicializa efeitos baseados em scroll
    const cleanupScrollEffects = initScrollEffects();
    
    // Função de limpeza para remover event listeners quando o componente for desmontado
    return () => {
      cleanupScrollEffects();
    };
  };
  
  export default initAnimations;