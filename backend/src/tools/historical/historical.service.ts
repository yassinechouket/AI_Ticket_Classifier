import { Injectable, Logger } from '@nestjs/common';

export interface HistoricalTicket {
  ticketId: string;
  category: string;
  priority: string;
  description: string;
  resolution: string;
  resolvedAt: string;
  resolutionTimeHours: number;
}

@Injectable()
export class HistoricalService {
  private readonly logger = new Logger(HistoricalService.name);
  private readonly ticketStore: HistoricalTicket[] = [];

  constructor() {
    this.seedSampleTickets();
  }

  async query(question: string): Promise<HistoricalTicket[]> {
    const keywords = question.toLowerCase().split(/\s+/);
    const scored = this.ticketStore.map((ticket) => {
      const text =
        `${ticket.category} ${ticket.priority} ${ticket.description} ${ticket.resolution}`.toLowerCase();
      const score = keywords.reduce(
        (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
        0,
      );
      return { ticket, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.ticket);
  }

  addTicket(ticket: HistoricalTicket): void {
    this.ticketStore.push(ticket);
  }

  private seedSampleTickets(): void {
    const samples: HistoricalTicket[] = [
      {
        ticketId: 'HIST-001',
        category: 'Infrastructure',
        priority: 'P1-Critical',
        description:
          'Production database server unresponsive, all services affected',
        resolution:
          'Identified memory leak in connection pooling. Restarted service and applied connection limit patch.',
        resolvedAt: '2025-12-15T14:30:00Z',
        resolutionTimeHours: 2.5,
      },
      {
        ticketId: 'HIST-002',
        category: 'Security',
        priority: 'P1-Critical',
        description:
          'Suspected unauthorized access to admin accounts detected by monitoring',
        resolution:
          'Disabled compromised accounts, rotated credentials, applied MFA enforcement. Root cause: phishing attack.',
        resolvedAt: '2025-11-20T09:00:00Z',
        resolutionTimeHours: 4,
      },
      {
        ticketId: 'HIST-003',
        category: 'Network',
        priority: 'P2-High',
        description: 'VPN connectivity failures affecting remote workforce',
        resolution:
          'VPN gateway certificate expired. Renewed certificate and restarted VPN concentrator.',
        resolvedAt: '2025-10-05T16:45:00Z',
        resolutionTimeHours: 1.5,
      },
      {
        ticketId: 'HIST-004',
        category: 'Software',
        priority: 'P2-High',
        description:
          'Email system delivery delays exceeding 30 minutes for all users',
        resolution:
          'Mail queue backlog due to anti-spam filter misconfiguration. Corrected filter rules and flushed queue.',
        resolvedAt: '2025-09-18T11:20:00Z',
        resolutionTimeHours: 3,
      },
      {
        ticketId: 'HIST-005',
        category: 'Cloud',
        priority: 'P2-High',
        description:
          'AWS S3 bucket permissions misconfigured exposing internal documents',
        resolution:
          'Reverted bucket policy to private, enabled CloudTrail logging, audited access logs.',
        resolvedAt: '2025-08-22T08:15:00Z',
        resolutionTimeHours: 1,
      },
      {
        ticketId: 'HIST-006',
        category: 'Database',
        priority: 'P2-High',
        description:
          'Database replication lag exceeding 60 seconds on read replicas',
        resolution:
          'Optimized slow queries causing write amplification. Added missing indexes on frequently joined tables.',
        resolvedAt: '2025-07-30T13:00:00Z',
        resolutionTimeHours: 5,
      },
      {
        ticketId: 'HIST-007',
        category: 'Access Management',
        priority: 'P3-Medium',
        description: 'New employee unable to access required applications',
        resolution:
          'Provisioned AD groups and application-specific roles per department onboarding checklist.',
        resolvedAt: '2025-07-15T10:30:00Z',
        resolutionTimeHours: 0.5,
      },
      {
        ticketId: 'HIST-008',
        category: 'Hardware',
        priority: 'P3-Medium',
        description:
          'Multiple workstations reporting intermittent blue screen errors',
        resolution:
          'Faulty RAM modules identified in batch. Replaced DIMM sticks and updated BIOS firmware.',
        resolvedAt: '2025-06-10T15:45:00Z',
        resolutionTimeHours: 8,
      },
      {
        ticketId: 'HIST-009',
        category: 'Monitoring',
        priority: 'P3-Medium',
        description: 'Alerting system sending false positive notifications',
        resolution:
          'Threshold values were too aggressive after infrastructure scaling. Adjusted alert thresholds and added cooldown periods.',
        resolvedAt: '2025-05-28T09:30:00Z',
        resolutionTimeHours: 2,
      },
      {
        ticketId: 'HIST-010',
        category: 'Service Request',
        priority: 'P4-Low',
        description: 'Request for additional monitor for developer workstation',
        resolution:
          'Approved and fulfilled from inventory. Updated asset tracking system.',
        resolvedAt: '2025-05-01T14:00:00Z',
        resolutionTimeHours: 24,
      },
    ];

    samples.forEach((t) => this.ticketStore.push(t));
  }
}
