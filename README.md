# Controle de Placas (Next.js + MongoDB + NextAuth)

Aplicação para cadastro, consulta e remoção de placas de carro com:

- Login com **NextAuth Credentials Provider** usando os campos `user` e `password`.
- Cadastro público de usuário com `user`, `email` e `password`.
- E-mail obrigatório no cadastro para suporte a fluxo de recuperação de senha.
- Controle de **cargo** (`user` e `admin`) e status de acesso (`isActive`).
- Área administrativa para gerenciar usuários: listar, editar, excluir e bloquear/desbloquear acesso.
- Rotas privadas para cadastro/listagem/busca/remoção de placas (`/plates` e `/api/plates`).

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente no `.env.local`:

```bash
MONGODB_URI="sua-string-do-mongodb"
AUTH_SECRET="uma-chave-secreta-longa"
```

3. Execute o projeto:

```bash
npm run dev
```

4. Acesse:

- Login: [http://localhost:3000](http://localhost:3000)
- Cadastro público: [http://localhost:3000/cadastro](http://localhost:3000/cadastro)
- Painel de placas (privado): [http://localhost:3000/plates](http://localhost:3000/plates)
- Gestão de usuários (somente admin): [http://localhost:3000/admin/usuarios](http://localhost:3000/admin/usuarios)

## API

### `POST /api/register`
Cadastra usuário comum (`role: user`, `isActive: true`).

Body JSON:

```json
{ "user": "usuario", "email": "usuario@email.com", "password": "123456" }
```

### `GET /api/admin/users`
Lista usuários (somente admin).

### `POST /api/admin/users`
Cadastra usuário pelo admin, permitindo definir cargo (`user` ou `admin`).

Body JSON:

```json
{ "user": "novo-admin", "email": "admin@email.com", "password": "123456", "role": "admin" }
```

### `PATCH /api/admin/users/:id`
Edita usuário (somente admin): `user`, `email`, `role`, `isActive`.

### `DELETE /api/admin/users/:id`
Exclui usuário (somente admin).

### `POST /api/auth/[...nextauth]`
Fluxo de autenticação do NextAuth com `credentials` (`user` e `password`).

### `POST /api/plates`
Cadastra uma placa (autenticado).

### `DELETE /api/plates`
Remove uma placa (autenticado).

### `GET /api/plates?query=IVG`
Busca placas por termo parcial (autenticado).

### `GET /api/plates?recent=1`
Retorna as últimas 5 placas cadastradas (autenticado).
