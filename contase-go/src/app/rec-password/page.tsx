"use client";
import React, { FormEvent, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { Usuario } from '../interfaces/IUser';
const recPass = () => {
    const router = useRouter();
    const [information, setInformation] = useState('');
    const [username, setUsername] = useState('');


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
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
                alert("Um e-mail foi enviado a sua conta com instruções para redefinir sua senha.");
                router.push('/login');
                
            } else {
                setInformation('Erro ao fazer login, verifique se digitou o e-mail corretamente');
            }
        } catch (error) {
            setInformation('Erro ao fazer login, verifique se digitou o e-mail corretamente');
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
                            <h2>Recuperação de senha</h2>
                        </div>
                    </Link>
                </div>
                <div className="login">
                    <h3>Digite seu email cadastrado</h3>
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
                        <button className="button-login" type="submit">Recuperar senha</button>
                    </form>
                    {information && <p>{information}</p>}
                    <Link href='/login'>Fazer Login</Link>
                </div>
            </div>
        </>
    );
};

export default recPass;
