import React from 'react';
import Link from 'next/link';
type Company = {
  cnpj: string;
  name: string;
  email: string;
  creationDate: string;
  phone: string;
  onDelete: () => void;
};

const CompanyRow: React.FC<Company> = ({ cnpj, name, email, creationDate, phone, onDelete }) => {
  return (
    <tr>
      <td>{cnpj}</td>
      <td>{name}</td>
      <td>{email}</td>
      <td>{creationDate}</td>
      <td>{phone}</td>
      <td>
        <Link className="btn-action edit" href={`/create-company/${cnpj}`}>
          Editar
        </Link>
        <button className="btn-action delete" onClick={onDelete}>
          Excluir
        </button>
      </td>
    </tr>
  );
};

export default CompanyRow;
