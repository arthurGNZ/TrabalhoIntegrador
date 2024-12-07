"use client";
import React, { FormEvent, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LoginScreen = () => {
    const router = useRouter();
    const [information, setInformation] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const loginData = {
            email: username,
            senha: password
        };

        try {
            const response = await fetch('link/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Login bem-sucedido:', data);
                router.push('/dashboard');
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Erro ao fazer login');
            }
        } catch (error) {
            setInformation('Erro ao fazer a requisição');
            console.error('Erro ao fazer login:', error);
        }
    };

    return (
        <>
            <div className="container">
                <div className="logo-container">
                    <a href="URL_DO_DESTINO" className="logo-styleDolink">
                        <Image src="/logo-simbolo.png" width="120" height="30" alt="Contaseg Logo" className="logo" />
                        <div className="title">
                            <h1>CONTASEG</h1>
                            <h2>CONTABILIDADE E SEGUROS</h2>
                        </div>
                    </a>
                </div>
                <div className="login">
                    <h3>Login</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input">
                            <label htmlFor="username">Usuário</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                required
                            />
                        </div>
                        <div className="input">
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Entrar</button>
                    </form>
                    {information && <p>{information}</p>}
                </div>
            </div>
        </>
    );
};

export default LoginScreen;
