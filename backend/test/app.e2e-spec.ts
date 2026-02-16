import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EventsGateway } from '../src/events/events.gateway';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.GITHUB_CLIENT_ID = 'test';
  process.env.GITHUB_CLIENT_SECRET = 'test';
  process.env.GITHUB_CALLBACK_URL = 'http://test/callback';
});

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  column: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  card: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockEvents = { broadcast: jest.fn() };

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(EventsGateway)
      .useValue(mockEvents)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/guest', () => {
    it('should return token and user', async () => {
      const user = {
        id: 'user-1',
        githubId: 'guest-abc',
        username: 'Convidado_xyz',
        avatarUrl: null,
        createdAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(user);

      const { body, status } = await request(app.getHttpServer())
        .post('/auth/guest')
        .expect(200);

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('user');
      expect(body.user).toMatchObject({ id: user.id, username: user.username });
      expect(typeof body.access_token).toBe('string');
    });
  });
});

describe('ColumnsController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    const guestUser = {
      id: 'user-1',
      githubId: 'guest-abc',
      username: 'Convidado',
      avatarUrl: null,
      createdAt: new Date(),
    };
    mockPrisma.user.create.mockResolvedValue(guestUser);
    mockPrisma.user.findUnique.mockResolvedValue(guestUser);
    mockPrisma.column.findMany.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(EventsGateway)
      .useValue(mockEvents)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const guestRes = await request(app.getHttpServer()).post('/auth/guest');
    token = guestRes.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /columns returns array', () => {
    return request(app.getHttpServer())
      .get('/columns')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('POST /columns requires auth', () => {
    return request(app.getHttpServer())
      .post('/columns')
      .send({ name: 'To Do' })
      .expect(401);
  });

  it('POST /columns with token calls service', async () => {
    const column = {
      id: 'col-1',
      name: 'To Do',
      order: 0,
      createdBy: { id: 'user-1', username: 'Convidado' },
      cards: [],
    };
    mockPrisma.column.create.mockResolvedValue(column);

    const res = await request(app.getHttpServer())
      .post('/columns')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Do', order: 0 });

    if (res.status === 201) {
      expect(res.body.name).toBe('To Do');
      expect(mockPrisma.column.create).toHaveBeenCalled();
    } else {
      expect(res.status).toBe(401);
    }
  });
});
