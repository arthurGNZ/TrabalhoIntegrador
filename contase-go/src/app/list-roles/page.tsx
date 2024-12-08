'use client';
import React, { useState, useEffect } from 'react';
import RoleRow from '../components/roleRow';
import './style.css'; 
import { Header } from '../components/header';

type Permission = {
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

const ListarRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  const handleEdit = (roleId: string) => {
    console.log(`Editando o papel com ID: ${roleId}`);
  };

  const handleDelete = (roleId: string) => {
    console.log(`Excluindo o papel com ID: ${roleId}`);
  };

  useEffect(() => {
    setTimeout(() => {
      const fetchedRoles: Role[] = [
        {
          id: 'admin',
          name: 'Administrador',
          description: 'Responsável por todas as permissões.',
          permissions: [
            { description: 'Gerenciar usuários, visualizar relatórios, configurar sistema.' },
          ],
        },
        {
          id: 'manager',
          name: 'Gerente',
          description: 'Gerencia operações e recursos.',
          permissions: [
            { description: 'Gerenciar operações, aprovar despesas, acessar relatórios financeiros.' },
          ],
        },
        {
          id: 'user',
          name: 'Usuário',
          description: 'Acesso limitado a funcionalidades básicas.',
          permissions: [
            { description: 'Visualizar dados próprios, realizar tarefas básicas.' },
          ],
        },
      ];
      setRoles(fetchedRoles);
    }, 1000); 
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
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <RoleRow
                key={role.id}
                id={role.id}
                name={role.name}
                description={role.description}
                permissions={role.permissions}
                onEdit={() => handleEdit(role.id)}
                onDelete={() => handleDelete(role.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListarRoles;
