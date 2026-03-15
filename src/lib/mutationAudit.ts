type MutationAuditParams = {
  action: string;
  orgNummer: number;
  compNumber?: number;
  resourceType: string;
  resourceId?: string;
  success: boolean;
  actor?: string;
  details?: Record<string, unknown>;
};

export function logMutationAudit(params: MutationAuditParams): void {
  const payload = {
    type: 'mutation_audit',
    timestamp: new Date().toISOString(),
    ...params,
  };
  console.log(JSON.stringify(payload));
}

