"use client";
import React, { FormEvent, useState, useEffect } from 'react';
import './new-password-style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaLock, FaArrowRight } from 'react-icons/fa';

const NewPasswordScreen = () => {
    const router = useRouter();
    const [information, setInformation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        
        // Validação básica
        if (password !== confirmPassword) {
            setInformation('As senhas não coincidem');
            setError(true);
            return;
        }
        
        if (password.length < 6) {
            setInformation('A senha deve ter pelo menos 6 caracteres');
            setError(true);
            return;
        }
        
        setLoading(true);
        setError(false);
        setInformation('');
        
        const passwordData = {
            nova_senha: password
        };
        
        try {
            const accessToken = localStorage.getItem('access_token');
            
            if (!accessToken) {
                setInformation('Sessão expirada. Faça login novamente.');
                setError(true);
                setLoading(false);
                setTimeout(() => handleNavigate('/login'), 2000);
                return;
            }
            
            const response = await fetch('http://localhost:3001/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(passwordData),
            });
            
            if (response.ok) {
                setInformation('Senha alterada com sucesso! Redirecionando...');
                setError(false);
                setTimeout(() => handleNavigate('/login'), 1500);
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Erro ao redefinir senha');
                setError(true);
            }
        } catch (error) {
            setInformation('Erro de conexão. Tente novamente.');
            setError(true);
            console.log('Erro ao alterar senha:', error);
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
                        <h2 className="login-title">Nova Senha</h2>
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <div className="input-icon-wrapper">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Nova senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div className="input-icon-wrapper">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Confirme a nova senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        Confirmar
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

export default NewPasswordScreen;