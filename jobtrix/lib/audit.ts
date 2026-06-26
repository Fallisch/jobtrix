import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "login_failed"
  | "account_deleted"
  | "account_exported"
  | "checkout_created"
  | "webhook_processed"
  | "email_sent"
  | "email_bounced"
  | "email_complained"
  | "password_reset_requested"
  | "password_reset_completed";

export async function logAudit(action: AuditAction, opts: { userId?: string; detail?: string; ip?: string } = {}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { action, userId: opts.userId, detail: opts.detail, ip: opts.ip },
    });
  } catch {
    // Audit-Logging darf nie den Request brechen
  }
}
