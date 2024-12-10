"use client";
import React, { FormEvent, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';

const NewPass = () => {

    const router = useRouter();
    const [information, setInformation] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const loginData = {
            nova_senha: password
        };
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(loginData),
            });
            if (response.ok) {
                const data = await response.json();                
                router.push('/login');
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Erro ao redefinir senha');
            }
        } catch (error) {
            setInformation('Erro ao fazer a requisição');
            console.log('Erro ao fazer login:', error);
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
                    <h3>Digite aqui a nova senha que deseja utilizar</h3>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit">Redefinir</button>
                    </form>
                    {information && <p>{information}</p>}
                </div>
            </div>
        </>
    );
};

export default NewPass;
