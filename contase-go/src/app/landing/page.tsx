'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBriefcase, FaChartBar, FaShieldAlt, FaMobileAlt, FaMapMarkerAlt, FaPhone, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import './style.css';
import { initAnimations } from './animations';
import AutoplayVideo from './AutoplayVideo'; // Importando o componente de vídeo

const LandingPage = () => {
  useEffect(() => {
    // Inicializa as animações quando o componente montar
    const cleanup = initAnimations();
    
    // Limpa as animações quando o componente desmontar
    return cleanup;
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="animated-bg"></div>
        
        <div className="navbar">
          <div className="logo">
            <Image 
              src="/logo-simbolo.png" 
              alt="ContaSeg Logo" 
              width={50} 
              height={50} 
              className="logo-image"
            />
            <span>CONTASEG</span>
          </div>
          <div className="nav-links">
            <Link href="/login" className="login-btn">
              <span>Login</span>
              <span className="btn-overlay"></span>
            </Link>
          </div>
        </div>

        <div className="hero-content">
          <h1>
            Soluções contábeis <br/><span className="highlight">com excelência</span>
          </h1>
          
          <p>
            Contabilidade profissional para sua empresa crescer com segurança e tranquilidade.
          </p>
          
          <div className="cta-buttons">
            <Link href="/login" className="primary-btn">
              Acessar Sistema
              <span className="btn-arrow">→</span>
            </Link>
            <Link href="#contato" className="secondary-btn">
              Fale Conosco
            </Link>
          </div>
        </div>
        
        <div className="hero-image-container">
          <div className="hero-image">
            <Image 
              src="/contaseg-20.jpg" 
              alt="Dashboard ContaSeg" 
              width={500} 
              height={400} 
              className="dashboard-preview"
            />
          </div>
        </div>
        
        <div className="scrolldown-indicator">
          <div className="mouse"></div>
          <p>Role para ver mais</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="servicos">
        <div className="section-header">
          <h2>Nossos Serviços</h2>
          <p className="section-subtitle">Soluções completas para a gestão do seu negócio</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FaBriefcase size={36} />
            </div>
            <h3>Contabilidade Empresarial</h3>
            <p>Suporte completo para empresas de todos os portes e segmentos.</p>
            <Link href="#" className="service-link">Saiba mais →</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FaChartBar size={36} />
            </div>
            <h3>Gestão Fiscal</h3>
            <p>Planejamento tributário e assessoria fiscal especializada.</p>
            <Link href="#" className="service-link">Saiba mais →</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FaShieldAlt size={36} />
            </div>
            <h3>Planejamento Tributário</h3>
            <p>Planejamento Tributário e serviços de Recuperação Tributária.</p>
            <Link href="#" className="service-link">Saiba mais →</Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FaMobileAlt size={36} />
            </div>
            <h3>Acesso Digital</h3>
            <p>Plataforma online para acompanhar seus documentos em tempo real.</p>
            <Link href="#" className="service-link">Saiba mais →</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number" data-count="29">
              <span className="counter">29</span>+
            </div>
            <div className="stat-title">Anos de Experiência</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number" data-count="1000">
              <span className="counter">1000</span>+
            </div>
            <div className="stat-title">Clientes Satisfeitos</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number" data-count="60">
              <span className="counter">60</span>+
            </div>
            <div className="stat-title">Especialistas</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number" data-count="99">
              <span className="counter">99</span>%
            </div>
            <div className="stat-title">Taxa de Satisfação</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="sobre">
        <div className="about-content">
          <div className="about-text">
            <h2>Sobre a ContaSeg</h2>
            <p>Somos uma empresa especializada em contabilidade e seguros, com mais de 29 anos de experiência no mercado. Nossa missão é oferecer soluções contábeis de qualidade, com atendimento personalizado e tecnologia de ponta.</p>
            <p>Nosso time de especialistas trabalha para garantir a tranquilidade de nossos clientes, oferecendo suporte contínuo e orientação estratégica para o crescimento sustentável de seus negócios.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Equipe especializada e qualificada</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Plataforma digital intuitiva</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Atendimento personalizado</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Conformidade com a legislação</div>
              </div>
            </div>
          </div>
          
          <div className="about-image">
            <div className="image-card">
              {/* Substitui a imagem pelo componente de vídeo */}
              <AutoplayVideo />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" id="depoimentos">
        <div className="section-header">
          <h2>O que nossos clientes dizem</h2>
          <p className="section-subtitle">Conheça a experiência de quem confia em nossos serviços</p>
        </div>
        
        <div className="testimonial-slider">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>A ContaSeg transformou a gestão contábil da minha empresa. O sistema é intuitivo e me permite acompanhar todos os relatórios em tempo real.</p>
              <div className="testimonial-author">
                <div className="author-image">
                  <Image 
                    src="/pessoa1.jpg" 
                    alt="Cliente" 
                    width={60} 
                    height={60} 
                  />
                </div>
                <div className="author-info">
                  <h4>Roberto Silva</h4>
                  <p>Empresário, RS Comércio</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>Desde que contratamos a ContaSeg, nossa gestão fiscal melhorou significativamente. O suporte é excelente e a equipe está sempre disponível para ajudar.</p>
              <div className="testimonial-author">
                <div className="author-image">
                  <Image 
                    src="/pessoa3.jpg" 
                    alt="Cliente" 
                    width={60} 
                    height={60} 
                  />
                </div>
                <div className="author-info">
                  <h4>Carla Mendes</h4>
                  <p>Diretora Financeira, Grupo CM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-icon">"</div>
              <p>O sistema da ContaSeg é simplesmente incrível! Consigo acessar meus dados contabeis de qualquer lugar a qualquer momento!.</p>
              <div className="testimonial-author">
                <div className="author-image">
                  <Image 
                    src="/pessoa2.jpg" 
                    alt="Cliente" 
                    width={60} 
                    height={60} 
                  />
                </div>
                <div className="author-info">
                  <h4>Paulo Santos</h4>
                  <p>CEO, Tech Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Pronto para transformar a gestão contábil da sua empresa?</h2>
          <p>Agende uma conversa com um dos nossos especialistas.</p>
          <Link href="#contato" className="cta-button">Agendar conversa</Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contato">
        <div className="section-header">
          <h2>Entre em Contato</h2>
          <p className="section-subtitle">Estamos à disposição para atendê-lo</p>
        </div>
        
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3>Endereço</h3>
                <p>Av. Getúlio Vargas, 3090N</p>
                <p>Bairro Líder - Chapecó, SC</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <div>
                <h3>Telefone</h3>
                <p>49 3319-1800</p>
                <a href="https://wa.me/554933191800" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                  <FaWhatsapp /> Fale pelo WhatsApp
                </a>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <FaInstagram />
              </div>
              <div>
                <h3>Redes Sociais</h3>
                <p>
                  <a href="https://www.instagram.com/contasegcontabilidade/" target="_blank" rel="noopener noreferrer" className="social-link">
                    @contasegcontabilidade
                  </a>
                </p>
                <p>
                  <a href="https://www.linkedin.com/company/contaseg/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaLinkedin /> LinkedIn
                  </a>
                </p>
              </div>
            </div>
            
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3552.5013940194513!2d-52.62422792526926!3d-27.077482200107116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94e4b5d6d8d7350d%3A0x4c512a61eb90c3bd!2sContaseg%20Contabilidade!5e0!3m2!1spt-PT!2sbr!4v1743175695191!5m2!1spt-PT!2sbr" 
                width="400" 
                height="250" 
                style={{border: 0}} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="location-map"
              ></iframe>
            </div>
          </div>
          
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label>Seu Nome</label>
                <input type="text" placeholder="Digite seu nome completo" required />
              </div>
              
              <div className="form-group">
                <label>Seu Email</label>
                <input type="email" placeholder="Digite seu email" required />
              </div>
              
              <div className="form-group">
                <label>Telefone</label>
                <input type="tel" placeholder="Digite seu telefone" />
              </div>
              
              <div className="form-group">
                <label>Mensagem</label>
                <textarea placeholder="Como podemos ajudar?" required></textarea>
              </div>
              
              <button type="submit" className="primary-btn submit-btn">
                Enviar Mensagem
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <Image 
                src="/logo-simbolo.png" 
                alt="ContaSeg Logo" 
                width={40} 
                height={40} 
              />
              <span>CONTASEG</span>
            </div>
            <p className="footer-tagline">Soluções contábeis com excelência para seu negócio.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/contasegcontabilidade/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/company/contaseg/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaLinkedin />
              </a>
              <a href="https://wa.me/554933191800" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaWhatsapp />
              </a>
            </div>
          </div>
          
          <div className="footer-nav">
            <div className="footer-nav-column">
              <h4>Navegação</h4>
              <Link href="#servicos">Serviços</Link>
              <Link href="#sobre">Sobre</Link>
              <Link href="#depoimentos">Depoimentos</Link>
              <Link href="#contato">Contato</Link>
            </div>
            
            <div className="footer-nav-column">
              <h4>Serviços</h4>
              <Link href="#">Contabilidade</Link>
              <Link href="#">Gestão Fiscal</Link>
              <Link href="#">Seguros</Link>
              <Link href="#">Consultoria</Link>
            </div>
            
            <div className="footer-nav-column">
              <h4>Suporte</h4>
              <Link href="#">Central de Ajuda</Link>
              <Link href="#">Política de Privacidade</Link>
              <Link href="#">Termos de Uso</Link>
              <Link href="/login">Área do Cliente</Link>
            </div>
          </div>
        </div>
        
     <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Arthur Grasnievcz, Gabriel Gois e Paula. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;