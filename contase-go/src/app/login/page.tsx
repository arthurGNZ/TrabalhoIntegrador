"use client";
import React, { FormEvent, useState, useEffect } from 'react';
import './login-style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

interface Permissao {
    sigla: string;
    nome: string;
}

interface Usuario {
    cpf: string;
    nome: string;
    email: string;
    cargo: string;
    permissoes: Permissao[];
    empresa: {
        cnpj: string;
        razao_social: string;
        email: string;
    };
}

const LoginScreen = () => {
    const router = useRouter();
    const [information, setInformation] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    function saveToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    function saveCpf(cpf: string) {
        localStorage.setItem('cpf', cpf);
    }

    function saveCargo(cargo: string) {
        localStorage.setItem('cargo', cargo);
    }

    function savePermissoes(permissoes: Permissao[]) {
        localStorage.setItem('permissoes', JSON.stringify(permissoes));
    }

    // Não precisamos mais do useEffect para adicionar a classe 'loaded'
    // Isso agora é manipulado no layout.tsx global

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
            senha: password
        };
        
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'  
                },
                body: JSON.stringify(loginData),
            });
            
            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                const decodedToken = jwtDecode<Usuario>(token);
                
                // Salvando os dados no localStorage
                saveToken(token);
                saveCpf(decodedToken.cpf);
                saveCargo(decodedToken.cargo);
                savePermissoes(decodedToken.permissoes);
                
                try {
                    let redirectPath = '';
                    
                    if(data.alterar_senha){
                        redirectPath = '/new-password';
                    } else {
                        const hasAdminPermission = decodedToken.permissoes.some(
                            perm => perm.sigla === 'ADM'
                        );
                        
                        redirectPath = hasAdminPermission ? '/home-admin' : '/home-user';
                    }
                    
                    handleNavigate(redirectPath);
                } catch (error) {
                    setInformation('Erro ao processar os dados do token');
                    setError(true);
                    console.log(error);
                }
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Credenciais inválidas');
                setError(true);
            }
        } catch (error) {
            setInformation('Erro de conexão. Tente novamente.');
            setError(true);
            console.log('Erro ao fazer login:', error);
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
                        <h2 className="login-title">Acesse sua conta</h2>
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <div className="input-icon-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="E-mail"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)} 
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div className="input-icon-wrapper">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                        Entrar
                                        <FaArrowRight className="button-icon" />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="forgot-password">
                            <button 
                                onClick={() => handleNavigate('/rec-password')}
                                className="forgot-link"
                                disabled={isNavigating}
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                        
                        <div className="back-to-site">
                            <button 
                                onClick={() => handleNavigate('/landing')}
                                className="back-link"
                                disabled={isNavigating}
                            >
                                Voltar para o site
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;