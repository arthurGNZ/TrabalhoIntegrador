import React, { FormEvent, useState } from 'react';
import './style.css';
import Image from 'next/image';
import Link from 'next/link';

const LandingScreen = () => {
    return (
        <>
        <header>
            <div className="logo-container">
                <Link href="#" className="logo-styleDoLink">
                    <Image src="/logo-simbolo.png" width='120' height='30' alt="Contaseg Logo" className="logo"/>
                    <div className="title">
                        <h1>CONTASEG</h1>
                        <h2>CONTABILIDADE E SEGUROS</h2>
                    </div>
                </Link>
            </div>
            <nav>
                <ul>
                    <li><Link href="/login">FAZER LOGIN</Link></li>
                    
                </ul>
            </nav>
        </header>
        <main>
            <section className="intro">
                <h3>Bem-vindo ao <strong>ContaseGo</strong>!<br/>
                    Acesse suas informações financeiras e contábeis de forma simples e segura.</h3>
            </section>
        <section className="footer">
            <nav>
                <ul>
                    <li><Link href='#'>Av. Getúlio Vargas, 3090N</Link></li>
                    <li><Link href='#'>Bairro Líder - Chapecó, SC</Link></li>
                    <li><Link href='#'>Fone: 49 3319-1800</Link></li>
                    <li><Link href={"https://www.instagram.com/contasegcontabilidade/"}>Instagram: @contasegcontabilidade</Link></li>
                </ul>
            </nav>
        </section>
        </main>
        </>
    );
}

export default LandingScreen;
