import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signToken } from '../config/jwt';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'restaurante';
  let candidate = root;
  for (let i = 0; i < 6; i += 1) {
    const existing = await prisma.tenant.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new Error('No se pudo generar un slug único para el restaurante');
}

export interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  tenant: { id: string; name: string; slug: string };
}

export const authService = {
  /**
   * Registers a new restaurant. Creates the Tenant and its OWNER user atomically.
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    const slug = await uniqueSlug(slugify(input.restaurantName));
    const passwordHash = await bcrypt.hash(input.password, 10);

    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const t = await tx.tenant.create({
        data: {
          name: input.restaurantName,
          slug,
        },
      });
      const u = await tx.user.create({
        data: {
          tenantId: t.id,
          email: input.email,
          passwordHash,
          name: input.name,
          role: 'OWNER',
        },
      });
      return { tenant: t, user: u };
    });

    const token = signToken({ userId: user.id, tenantId: tenant.id, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { tenant: true },
    });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new Error('Credenciales inválidas');
    }

    const token = signToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    };
  },

  async me(userId: string): Promise<Omit<AuthResult, 'token'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    };
  },
};
