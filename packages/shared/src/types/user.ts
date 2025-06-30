import { z } from 'zod';

// User role enums
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

// User profile schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
  isEmailVerified: z.boolean().default(false),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      workflowFailures: z.boolean().default(true),
      weeklyReports: z.boolean().default(false),
    }).default({}),
  }).default({}),
  metadata: z.object({
    lastLoginAt: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    onboardingCompleted: z.boolean().default(false),
    trialEndsAt: z.string().datetime().optional(),
  }),
});

export type User = z.infer<typeof UserSchema>;

// Workspace schema
export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  ownerId: z.string(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).default(SubscriptionTier.FREE),
  settings: z.object({
    allowPublicTemplates: z.boolean().default(true),
    requireApprovalForPublishing: z.boolean().default(false),
    maxWorkflows: z.number().default(3),
    maxExecutionsPerMonth: z.number().default(500),
    customBranding: z.boolean().default(false),
  }).default({}),
  usage: z.object({
    workflowCount: z.number().default(0),
    executionsThisMonth: z.number().default(0),
    storageUsed: z.number().default(0), // in bytes
  }).default({}),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    lastActivityAt: z.string().datetime().optional(),
  }),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

// Workspace member schema
export const WorkspaceMemberSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).default([]),
  invitedBy: z.string().optional(),
  joinedAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().optional(),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().default(false),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  workspaceName: z.string().min(2).optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;

export const UpdatePasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordSchema>;

// JWT payload schema
export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  workspaceId: z.string().optional(),
  role: z.nativeEnum(UserRole),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// API key schema for programmatic access
export const APIKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  permissions: z.array(z.string()),
  lastUsedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type APIKey = z.infer<typeof APIKeySchema>;

// Invitation schema
export const InvitationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  invitedBy: z.string(),
  token: z.string(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type Invitation = z.infer<typeof InvitationSchema>;