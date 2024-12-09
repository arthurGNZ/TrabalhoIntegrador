'use client';
import React from "react";
import Link from "next/link";

type Permission = {
  role: string;
  company: string;
};

type UserRowProps = {
  userId: string;
  name: string;
  email: string;
  isExpanded: boolean;
  permissions: Permission[]; 
  onDelete: () => void;
  onTogglePermissions: (userId: string) => void;
};

const UserRow: React.FC<UserRowProps> = ({
  userId,
  name,
  email,
  isExpanded,
  permissions,
  onDelete,
  onTogglePermissions,
}) => {
  return (
    <>
      <tr>
        <td className="accordion-arrow" onClick={() => onTogglePermissions(userId)}>
          {isExpanded ? "▼" : "▶"}
        </td>
        <td>{name}</td>
        <td>{email}</td>
        <td>
          <Link href={`/create-user/${userId}`}className="btn-action edit">Editar</Link>
          <button className="btn-action delete" onClick={onDelete}>Excluir</button>
        </td>
      </tr>
      {isExpanded && permissions.length > 0 && (
        <tr className="permissions-row">
          <td colSpan={4}>
            <table className="table-mini">
              <thead>
                <tr>
                  <th>Papel</th>
                  <th>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <tr key={index}>
                    <td>{permission.role}</td>
                    <td>{permission.company}</td>
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

export default UserRow;
