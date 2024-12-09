'use client';
import React, { useState, useEffect } from 'react';
import RoleRow from '../components/roleRow';
import './style.css'; 
import { Header } from '../components/header';

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

  const handleEdit = (roleId: string) => {
    console.log(`Editando o papel com ID: ${roleId}`);
  };

  const handleDelete = (roleId: string) => {
    console.log(`Excluindo o papel com ID: ${roleId}`);
  };
  async function loadRoles() {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
  
      if (response.ok) {
         console.log(response);
         const data = await response.json();
         setRoles(data.data);
      } else {
        console.error(`Erro ao carregar usuários: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
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
                onEdit={() => handleEdit(role.sigla_cargo)}
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
