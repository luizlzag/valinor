# API - Frontend Integration

Base URL: `https://seu-backend.onrender.com` (ou `http://localhost:3000` em dev)

---

## Autenticação

| Método | Rota | Auth | Body | Descrição |
|--------|------|------|------|-----------|
| POST | `/auth/guest` | ❌ | - | Entrar como convidado |
| GET | `/auth/github` | ❌ | - | Redireciona para login GitHub |
| GET | `/auth/github/callback` | ❌ | - | Callback do GitHub (uso interno) |
| GET | `/auth/me` | ✅ | - | Retorna usuário logado |

Todas as rotas de **criação, edição e exclusão** (cards, columns) exigem:
```
Authorization: Bearer <token>
```

### POST /auth/guest — Entrar como convidado

Cria um usuário convidado e retorna token. Sem autenticação prévia.

**Request:**
```http
POST /auth/guest
Content-Type: application/json
```
Sem body.

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "Convidado_a1b2c3d4"
  }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `access_token` | string | JWT para usar no header `Authorization: Bearer <token>` |
| `user.id` | string | UUID do usuário |
| `user.username` | string | `Convidado_{suffix}` — suffix aleatório de 8 caracteres |

O convidado tem as mesmas permissões que um usuário GitHub: cria/edita/remove cards e colunas, aparece em `createdBy`. Tratar no frontend igual ao login GitHub.

### GET /auth/github — Login com GitHub

Redireciona o usuário para a página de autorização do GitHub. Após autorizar, o backend redireciona para:
```
{FRONTEND_URL}/auth/callback?token={jwt}&user={id,username}
```

### GET /auth/me — Usuário logado

**Request:**
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "githubId": "12345678",
  "username": "octocat",
  "avatarUrl": "https://avatars.githubusercontent.com/...",
  "createdAt": "2026-02-15T12:00:00.000Z"
}
```

Para convidados: `githubId` começa com `guest-`, `avatarUrl` é `null`.

---

## Socket.IO (tempo real)

**Namespace:** `/kanban`

**Conexão no frontend:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/kanban');

socket.on('card:created', (card) => { /* adicionar card ao estado */ });
socket.on('card:updated', (card) => { /* atualizar card (inclui movimento) */ });
socket.on('card:deleted', (card) => { /* remover card */ });

socket.on('column:created', (column) => { /* adicionar coluna */ });
socket.on('column:updated', (column) => { /* atualizar coluna */ });
socket.on('column:deleted', (column) => { /* remover coluna */ });
```

| Evento | Payload | Quando |
|--------|---------|--------|
| `card:created` | Card completo (com column, createdBy) | Após POST /cards |
| `card:updated` | Card completo | Após PATCH /cards/:id |
| `card:deleted` | Card removido | Após DELETE /cards/:id |
| `column:created` | Coluna completa (com cards) | Após POST /columns |
| `column:updated` | Coluna completa | Após PATCH /columns/:id |
| `column:deleted` | Coluna removida | Após DELETE /columns/:id |

---

## Columns

| Método | Rota | Auth | Body | Descrição |
|--------|------|------|------|-----------|
| POST | `/columns` | ✅ | `{ name: string, order?: number }` | Cria coluna |
| GET | `/columns` | ❌ | - | Lista todas (com cards e createdBy) |
| GET | `/columns/:id` | ❌ | - | Busca uma por ID |
| PATCH | `/columns/:id` | ✅ | `{ name?: string, order?: number }` | Atualiza |
| DELETE | `/columns/:id` | ✅ | - | Remove |

**Exemplo criar coluna:**
```http
POST /columns
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "To Do", "order": 0 }
```

---

## Cards

| Método | Rota | Auth | Body | Descrição |
|--------|------|------|------|-----------|
| POST | `/cards` | ✅ | `{ title: string, content?: string, columnId: string }` | Cria card |
| GET | `/cards` | ❌ | - | Lista todos (com column e createdBy) |
| GET | `/cards/column/:columnId` | ❌ | - | Lista cards de uma coluna |
| GET | `/cards/:id` | ❌ | - | Busca um por ID |
| PATCH | `/cards/:id` | ✅ | `{ title?: string, content?: string, columnId?: string }` | Atualiza (inclui mover entre colunas) |
| DELETE | `/cards/:id` | ✅ | - | Remove |

**Exemplo criar card:**
```http
POST /cards
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Implementar login", "content": "Descrição opcional", "columnId": "uuid-da-coluna" }
```

**Exemplo mover card para outra coluna:**
```http
PATCH /cards/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "columnId": "uuid-da-nova-coluna" }
```

---

## Respostas de erro

- `401 Unauthorized` — Token ausente ou inválido
- `400 Bad Request` — Dados inválidos (ex: columnId inexistente)
- `404 Not Found` — Recurso não encontrado

---

## Testes

Stack: **Jest** + **Supertest**

### Comandos

```bash
npm test        # Testes unitários
npm run test:e2e # Testes E2E (integração)
```

### Testes unitários (`*.spec.ts`)

| Arquivo | Cobertura |
|---------|-----------|
| `auth.controller.spec.ts` | Controller definido, guest retorna token |
| `auth.service.spec.ts` | createGuest cria usuário e retorna token |
| `cards.controller.spec.ts` | findAll, findOne |
| `cards.service.spec.ts` | create (valida coluna, broadcast), findAll |
| `columns.controller.spec.ts` | findAll |
| `columns.service.spec.ts` | create (broadcast), findOne (NotFoundException) |

Mocks: PrismaService, EventsGateway. Sem banco real.

### Testes E2E (`test/*.e2e-spec.ts`)

| Teste | Rota | Descrição |
|-------|------|-----------|
| POST /auth/guest | `POST /auth/guest` | Retorna `access_token` e `user` |
| GET /columns | `GET /columns` | Retorna array |
| POST /columns sem auth | `POST /columns` | Retorna 401 |
| POST /columns com token | `POST /columns` | Chama service (201 ou 401) |

AppModule com PrismaService e EventsGateway mockados. Não requer banco de dados.

---

## Ordem de uso

1. **Login:** `POST /auth/guest` ou redirecionar para `GET /auth/github` → obter token e user
2. Salvar token e user (localStorage/sessionStorage)
3. `GET /columns` → carregar colunas (e cards) do board
4. Para criar coluna: `POST /columns` com token
5. Para criar card: `POST /cards` com token e `columnId` de uma coluna existente
6. Para mover card: `PATCH /cards/:id` com novo `columnId`
