import React, { useState } from 'react';

type Permission = {
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  onEdit: () => void;
  onDelete: () => void;
};

const RoleRow: React.FC<Role> = ({ id, name, description, permissions, onEdit, onDelete }) => {
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
        <td>{name}</td>
        <td>{description}</td>
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
                {permissions.map((permission, index) => (
                  <tr key={index}>
                    <td>{permission.description}</td>
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
