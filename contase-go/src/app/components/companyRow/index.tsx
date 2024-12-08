import React from 'react';

type Company = {
  cnpj: string;
  name: string;
  email: string;
  creationDate: string;
  phone: string;
  onEdit: () => void;
  onDelete: () => void;
};

const CompanyRow: React.FC<Company> = ({ cnpj, name, email, creationDate, phone, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{cnpj}</td>
      <td>{name}</td>
      <td>{email}</td>
      <td>{creationDate}</td>
      <td>{phone}</td>
      <td>
        <button className="btn-action edit" onClick={onEdit}>
          Editar
        </button>
        <button className="btn-action delete" onClick={onDelete}>
          Excluir
        </button>
      </td>
    </tr>
  );
};

export default CompanyRow;
