import { HistoricalService } from './historical.service';

describe('HistoricalService', () => {
  let service: HistoricalService;

  beforeEach(() => {
    service = new HistoricalService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return matching tickets for database query', async () => {
    const results = await service.query('database server down');

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((t) =>
        t.description.toLowerCase().includes('database'),
      ),
    ).toBe(true);
  });

  it('should return matching tickets for security query', async () => {
    const results = await service.query('unauthorized access security breach');

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((t) => t.category === 'Security'),
    ).toBe(true);
  });

  it('should return matching tickets for VPN query', async () => {
    const results = await service.query('VPN connectivity issues');

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((t) =>
        t.description.toLowerCase().includes('vpn'),
      ),
    ).toBe(true);
  });

  it('should return empty for unrelated query', async () => {
    const results = await service.query('xyzabc123nonexistent');

    expect(results).toEqual([]);
  });

  it('should return at most 5 results', async () => {
    const results = await service.query('the a is and or');

    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('should allow adding new tickets', async () => {
    service.addTicket({
      ticketId: 'HIST-CUSTOM',
      category: 'Custom',
      priority: 'P4-Low',
      description: 'Custom test xyzfoobar ticket',
      resolution: 'Custom resolution',
      resolvedAt: '2026-01-01T00:00:00Z',
      resolutionTimeHours: 1,
    });

    const results = await service.query('xyzfoobar');
    expect(results.length).toBe(1);
    expect(results[0].ticketId).toBe('HIST-CUSTOM');
  });
});
