"use client";
import React, { FormEvent, useState } from 'react';
import './rec-password-style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { Usuario } from '../interfaces/IUser';

const recPass = () => {
    const router = useRouter();
    const [information, setInformation] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigate = (path: string) => {
        setIsNavigating(true);
        document.body.classList.add('unloading');
        document.body.classList.remove('loaded');
        
        // Aguarde a animação de saída antes de navegar
        setTimeout(() => {
            router.push(path);
        }, 300);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(false);
        setInformation('');
        
        const loginData = {
            email: username,
        };
        
        try {
            const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/lost-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'  
                },
                body: JSON.stringify(loginData),
            });
            
            if (response.ok) {
                setInformation('Um e-mail foi enviado com instruções para redefinir sua senha.');
                setError(false);
                
                // Aguardar alguns segundos antes de redirecionar para página de login
                setTimeout(() => {
                    handleNavigate('/login');
                }, 3000);
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Erro ao recuperar senha. Verifique se digitou o e-mail corretamente.');
                setError(true);
            }
        } catch (error) {
            setInformation('Erro de conexão. Tente novamente mais tarde.');
            setError(true);
            console.log('Erro ao recuperar senha:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-wrapper ${isNavigating ? 'navigating' : ''}`}>
            <div className="login-card">
                <div className="card-content">
                    <div 
                        className="logo-container" 
                        onClick={() => handleNavigate('/landing')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Image 
                            src="/logo-simbolo.png" 
                            width={70} 
                            height={70} 
                            alt="Contaseg Logo" 
                            className="logo-image" 
                        />
                        <div className="logo-text">
                            <span className="logo-title">ContaseGO</span>
                        </div>
                    </div>
                    
                    <div className="login-form-container">
                        <h2 className="login-title">Recuperação de Senha</h2>
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <div className="input-icon-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        id="username"
                                        name="username"
                                        placeholder="E-mail cadastrado"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)} 
                                        required
                                    />
                                </div>
                            </div>
                            
                            {information && (
                                <div className={`message ${error ? 'error' : 'info'}`}>
                                    {information}
                                </div>
                            )}
                            
                            <button 
                                className={`login-button ${loading ? 'loading' : ''}`} 
                                type="submit" 
                                disabled={loading || isNavigating}
                            >
                                {loading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    <>
                                        Recuperar Senha
                                        <FaArrowRight className="button-icon" />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="back-to-site">
                            <button 
                                onClick={() => handleNavigate('/login')}
                                className="back-link"
                                disabled={isNavigating}
                            >
                                Voltar para o login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default recPass;