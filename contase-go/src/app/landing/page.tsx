import React, { FormEvent, useState } from 'react';
import './style.css';
import Image from 'next/image';
import Link from 'next/link';

const LandingScreen = () => {
    return (
        <>
        <body>
        <header>
            <div className="logo-container">
                <a href="URL_DO_DESTINO" className="logo-styleDoLink">
                    <Image src="/logo-simbolo.png" width='120' height='30' alt="Contaseg Logo" className="logo"/>
                    <div className="title">
                        <h1>CONTASEG</h1>
                        <h2>CONTABILIDADE E SEGUROS</h2>
                    </div>
                </a>
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
                    <li>Av. Getúlio Vargas, 3090N</li>
                    <li>Bairro Líder - Chapecó, SC</li>
                    <li>Fone: 49 3319-1800</li>
                    <li>Instagram: @contasegcontabilidade</li>
                </ul>
            </nav>
        </section>
        </main>
        </body>
        </>
    );
}

export default LandingScreen;
