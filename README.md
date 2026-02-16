# Kanban

**Aplicacao online:** https://kanban-front.netlify.app/login

---

## Stack

### Frontend
- Angular 21
- Angular CDK
- ng-icons (Heroicons)
- RxJS
- socket.io-client
- Vitest
- TypeScript 5.9

### Backend
- NestJS 11
- Prisma 7 (PostgreSQL)
- Passport (JWT + GitHub OAuth)
- Socket.io (WebSockets)
- Jest
- TypeScript 5.7

### Banco de dados
- PostgreSQL

### Deploy
- Frontend: Netlify
- Backend: Render

---

## Estrutura

```
Kanban/
├── frontend/     # Angular SPA
├── backend/      # NestJS API
```

---

## Execucao local

**Backend:**
```bash
cd backend
cp .env.example .env   # configurar DATABASE_URL e variaveis de auth
npm install
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Modelos (Prisma)

- **User**: id, githubId, username, avatarUrl
- **Column**: id, name, order, createdById
- **Card**: id, title, content, columnId, createdById, createdAt

---

## Contato

- WhatsApp: 17 991760569
- Email: Luiz.sa.cruz@gmail.com
- LinkedIn: https://www.linkedin.com/in/luiz-sanches-715b45162
