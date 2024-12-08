"use client";
import React, { FormEvent, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';

const LoginScreen = () => {
        
    function saveTokenAndExpirationTime (token: any) {
        const expirationTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;//1 Mês
        localStorage.setItem('access_token', token);
        localStorage.setItem('expires_in', expirationTime.toString());
    }

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
            const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Login bem-sucedido:', data);
                saveTokenAndExpirationTime(data.token);
                const token = data.token;
                try {
                    const decodedToken = jwtDecode(token);
                    console.log('Dados do usuário:', decodedToken);
                    //adicionar lógica para adm/trocar_senha/user
                    router.push('/home-admin');
                } catch (error) {
                    setInformation('Erro ao processar os dados do token');
                    console.error(error);
                }
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
            <div className="container-login">
                <div className="logo-container">
                    <Link href="/landing" className="logo-center">
                        <Image src="/logo-simbolo.png" width="120" height="30" alt="Contaseg Logo" className="logo-login" />
                        <div className="title">
                            <h1>CONTASEG</h1>
                            <h2>CONTABILIDADE E SEGUROS</h2>
                        </div>
                    </Link>
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
