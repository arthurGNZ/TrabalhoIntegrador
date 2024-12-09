import React, { useState } from 'react';
import Link from 'next/link';

type Permission = {
  sigla: string;
  nome: string;
};

type Role = {
  sigla_cargo: string;
  nome: string;
  permissoes: Permission[];
  onDelete: () => void;
};

const RoleRow: React.FC<Role> = ({ sigla_cargo, nome, permissoes, onDelete }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const togglePermissions = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <tr>
        <td className="accordion-arrow" onClick={togglePermissions}>
          {expanded ? '▼' : '▶'}
        </td>
        <td>{nome}</td>
        <td>{sigla_cargo}</td>
        <td>
          <Link className="btn-action edit" href={`/create-role/${sigla_cargo}`}>Editar</Link>
          <button className="btn-action delete" onClick={onDelete}>Excluir</button>
        </td>
      </tr>
      {expanded && (
        <tr className="permissions-row">
          <td colSpan={4}>
            <table className="table-mini">
              <thead>
                <tr>
                  <th>Permissão</th>
                </tr>
              </thead>
              <tbody>
                {permissoes.map((permissoes, index) => (
                  <tr key={index}>
                    <td>{permissoes.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};

export default RoleRow;
