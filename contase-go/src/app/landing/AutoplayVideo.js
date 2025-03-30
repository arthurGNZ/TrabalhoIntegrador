'use client';

import React, { useEffect, useRef, useState } from 'react';

const AutoplayVideo = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userMuted, setUserMuted] = useState(false);  // Estado para rastrear se o usuário mutou manualmente

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
        
        if (entry.isIntersecting && videoRef.current) {
          // Inicia o vídeo quando entrar na viewport
          videoRef.current.play().catch(error => {
            console.log("Reprodução automática falhou:", error);
          });
          
          // Só ativa o som se o usuário não tiver mutado manualmente
          if (!userMuted) {
            videoRef.current.muted = false;
          }
        } else if (videoRef.current) {
          // Pausa o vídeo quando sair da viewport
          videoRef.current.pause();
          // Sempre muda o vídeo ao sair do viewport (questão de cortesia)
          videoRef.current.muted = true;
        }
      },
      { threshold: 0.5 } // Ativa quando pelo menos 50% do elemento está visível
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [userMuted]);

  return (
    <div ref={containerRef} className="video-container">
      <video 
        ref={videoRef}
        className="about-video"
        width="100%" 
        height="auto"
        muted={true} // Começa sempre mudo
        playsInline
        loop
        controls={false}
      >
        <source src="/contaseg.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
      
      <div className="experience-badge">
        <span className="years">29+</span>
        <span className="text">Anos de<br/>Experiência</span>
      </div>
      
      {/* Botão de som para mobile (opcional) */}
      <button 
        className={`sound-toggle ${isVisible ? 'visible' : ''}`}
        onClick={() => {
          if (videoRef.current) {
            const newMutedState = !videoRef.current.muted;
            videoRef.current.muted = newMutedState;
            setUserMuted(newMutedState); // Guarda a preferência do usuário
          }
        }}
      >
        {videoRef.current && !videoRef.current.muted ? 'Silenciar' : 'Ativar Som'}
      </button>
    </div>
  );
};

export default AutoplayVideo;