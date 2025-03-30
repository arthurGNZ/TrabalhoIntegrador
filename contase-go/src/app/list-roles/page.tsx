'use client';
import React, { useState, useEffect } from 'react';
import RoleRow from '../components/roleRow';
import './style.css'; 
import { Header } from '../components/header';
import { useRouter } from 'next/navigation';
type Permission = {
  sigla: string;
  nome: string;
};

type Role = {
  sigla_cargo: string;
  nome: string;
  permissoes: Permission[];
};

const ListarRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const router = useRouter();
  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:3001/auth/validate-token', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'ngrok-skip-browser-warning': 'true'  
          }
    });
    if (response.ok) {
      const verifyToken = await response.json();
      if (!verifyToken.valid) {
        router.push('/login');
      }
    }
  }
    

  useEffect(() => {
    verifyToken();
  },[]);

  const handleDelete = async (roleSigla: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir este papel? Esta operação não pode ser desfeita.`);
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/role/${roleSigla}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          alert('Papel excluído com sucesso!');
          setRoles(roles.filter(role => role.sigla_cargo !== roleSigla));
        } else {
          console.log(`Erro ao excluir o papel: ${response.status} - ${response.statusText}`);
          alert('Erro ao excluir o papel.');
        }
      } catch (error) {
        console.log('Erro na requisição DELETE:', error);
        alert('Erro ao excluir o papel.');
      }
    }
  };


  async function loadRoles() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
         const data = await response.json();
         setRoles(data.data);
      } else {
        console.log(`Erro ao carregar usuários: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
    }
  }
  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div className="container">
      <Header/>
      <div className="list-roles">
        <h3>Papéis Registrados</h3>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Nome do Papel</th>
              <th>Sigla</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <RoleRow
                key={role.sigla_cargo}
                sigla_cargo={role.sigla_cargo}
                nome={role.nome}
                permissoes={role.permissoes}
                onDelete={() => handleDelete(role.sigla_cargo)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListarRoles;
