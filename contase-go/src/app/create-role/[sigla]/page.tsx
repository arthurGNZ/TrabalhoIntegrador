'use client';
import React, { useState, useEffect } from 'react';
import './style.css';
import { Header } from '../../components/header';
import { usePathname, useRouter } from 'next/navigation';

const CreateRole = () => {
  const router = useRouter();
  const params = usePathname();
  const [siglaCargo, setSiglaCargo] = useState('');
  const [nomeCargo, setNomeCargo] = useState('');
  const [permissoes, setPermissoes] = useState<{ sigla: string, nome: string }[]>([]);
  const [selectedPermissoes, setSelectedPermissoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSiglaEditable, setSiglaEditable] = useState(false);
  
  let sigla: string | null = null;
  async function verifyToken() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/auth/validate-token', {
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

  async function loadRole() {
    const accessToken = localStorage.getItem('access_token');
    sigla = params?.replace('/create-role/', '') ? params.replace('/create-role/', '') : null;
    if (sigla && sigla !== 'new') {
      const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/role/${sigla}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'  
        },
      });
      if (response.ok) {
        const roleTMP = await response.json();
        setSiglaEditable(true);
        const roleDTO = roleTMP.data;
        setSiglaCargo(roleDTO.sigla_cargo);
        setNomeCargo(roleDTO.nome);
        setSelectedPermissoes(roleDTO.permissoes.map((p: any) => p.sigla)); 
      } else {
        setError('Erro ao carregar os dados do papel.');
      }
    }
  }

  async function loadPermissions() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/role/permissions/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true'  
      },
    });

    if (response.ok) {
      const data = await response.json();
      setPermissoes(data.data);
    } else {
      setError('Erro ao carregar permissões.');
    }
  }

  async function saveRole() {
    const role = {
      sigla_cargo: siglaCargo,
      nome: nomeCargo,
      permissoes: selectedPermissoes.map(sigla => ({
        sigla_permissao: sigla
      }))
    };
    
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('https://8351-177-184-217-182.ngrok-free.app/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(role),
      });

      if (response.ok) {
        router.push('/list-roles');
      } else {
        const errorText = await response.text();
        setError(`Erro ao criar papel`);
      }
    } catch (error) {
      setError('Ocorreu um erro ao criar o papel. Tente novamente.');
      console.log('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRole() {
    const role = {
      sigla_cargo: siglaCargo,
      nome: nomeCargo,
      permissoes: selectedPermissoes.map(sigla => ({
        sigla_permissao: sigla
      }))
    };
    
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      sigla = params?.replace('/create-role/', '') ? params.replace('/create-role/', '') : null;
      const response = await fetch(`https://8351-177-184-217-182.ngrok-free.app/role/${sigla}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(role),
      });

      if (response.ok) {
        router.push('/list-roles');
      } else {
        const errorText = await response.text();
        console.log(errorText);
        setError(`Erro ao atualizar papel:`);
      }
    } catch (error) {
      setError('Ocorreu um erro ao atualizar o papel. Tente novamente.');
      console.log('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    sigla = params?.replace('/create-role/', '') ? params.replace('/create-role/', '') : null;
    e.preventDefault();
    if (sigla === 'new') {
      saveRole();
    } else {
      updateRole();
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>, sigla: string) => {
    if (e.target.checked) {
      setSelectedPermissoes([...selectedPermissoes, sigla]);
    } else {
      setSelectedPermissoes(selectedPermissoes.filter((item) => item !== sigla));
    }
  };

  useEffect(() => {
    loadPermissions();
    loadRole();
  }, []);

  return (
    <div>
      <Header />
      <div className="container-create">
        <div className="create-role">
          <h3>{sigla === 'new' ? 'Criar Novo Papel' : 'Editar Papel'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="sigla_cargo">Sigla do Cargo</label>
                <input
                  type="text"
                  id="sigla_cargo"
                  name="sigla_cargo"
                  value={siglaCargo}
                  onChange={(e) => setSiglaCargo(e.target.value)}
                  required
                  readOnly={isSiglaEditable}
                />
              </div>
              <div className="input-group">
                <label htmlFor="nome_cargo">Nome do Cargo</label>
                <input
                  type="text"
                  id="nome_cargo"
                  name="nome_cargo"
                  value={nomeCargo}
                  onChange={(e) => setNomeCargo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="permissoes">Permissões</label>
                <div className="checkbox-group">
                  {permissoes.map((permissao) => (
                    <div key={permissao.sigla} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`permissao-${permissao.sigla}`}
                        value={permissao.sigla}
                        checked={selectedPermissoes.includes(permissao.sigla)}
                        onChange={(e) => handlePermissionChange(e, permissao.sigla)}
                      />
                      <label htmlFor={permissao.sigla}>{permissao.nome}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={isLoading} className="subBtn">
              {isLoading ? 'Salvando papel...' : "Salvar Papel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;