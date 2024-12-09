import React, { useState } from 'react';

type Permission = {
  sigla: string;
  nome: string;
};

type Role1 = {
  sigla_cargo: string;
  nome: string;
  permissoes: Permission[];
  onEdit: () => void;
  onDelete: () => void;
};

const RoleRow: React.FC<Role1> = ({ sigla_cargo, nome, permissoes, onEdit, onDelete }) => {
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
          <button className="btn-action edit" onClick={onEdit}>Editar</button>
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
