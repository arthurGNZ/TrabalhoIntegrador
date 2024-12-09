export interface Usuario {
    cpf: string;
    nome: string;
    email: string;
    empresa: any;  
    cargo: string;
    permissoes: string[]; 
    iat: number;
    exp: number;
  }