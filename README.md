# Controle de Placas (Next.js + MongoDB)

Aplicação para cadastro, consulta e remoção de placas de carro com:

- Cadastro de placas no banco MongoDB.
- Busca exata e parcial (ex: `IVG`, `IV`).
- Remoção de placas não autorizadas.
- Exibição dos últimos cadastros para conferência (evitar erro de digitação).
- Resultado destacado em **verde** quando encontra e **vermelho** quando não encontra.
- Layout responsivo para celular, tablet e desktop.
- Todas as chamadas feitas pelo backend do Next.js (`/api/plates`).

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente (`.env.local`):

```env
MONGODB_URI="mongodb+srv://fernandonoguez:<db_password>@date.yvw9t.mongodb.net/?appName=Date"
```

> Substitua `<db_password>` pela senha real do banco.

3. Execute o projeto:

```bash
npm run dev
```

4. Acesse:

- [http://localhost:3000](http://localhost:3000)

## API

### `POST /api/plates`
Cadastra uma placa.

Body JSON:

```json
{ "plate": "IVG8470" }
```

### `DELETE /api/plates`
Remove uma placa.

Body JSON:

```json
{ "plate": "IVG8470" }
```

### `GET /api/plates?query=IVG`
Busca placas cadastradas por termo parcial.

### `GET /api/plates?recent=1`
Retorna as últimas 5 placas cadastradas (mais recente primeiro).
