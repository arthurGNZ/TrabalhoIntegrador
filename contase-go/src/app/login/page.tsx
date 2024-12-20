"use client";
import React, { FormEvent, useState } from 'react';
import './style.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';

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
                    if(data.alterar_senha){
                        router.push('/new-password');
                    } else {
                        const hasAdminPermission = decodedToken.permissoes.some(
                            perm => perm.sigla === 'ADM'
                        );
                        
                        if(hasAdminPermission){
                            router.push('/home-admin');
                        } else {
                            router.push('/home-user');
                        }
                    }
                } catch (error) {
                    setInformation('Erro ao processar os dados do token');
                    console.log(error);
                }
            } else {
                const errorData = await response.json();
                setInformation(errorData.message || 'Erro ao fazer login');
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
                        <button className="button-login" type="submit">Entrar</button>
                    </form>
                    {information && <p>{information}</p>}
                    <Link href='/rec-password'>Esqueci minha senha</Link>
                </div>
            </div>
        </>
    );
};

export default LoginScreen;