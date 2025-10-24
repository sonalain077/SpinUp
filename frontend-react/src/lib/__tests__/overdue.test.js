/**
 * Tests unitaires pour lib/overdue.js
 * Conformément aux bonnes pratiques définies dans copilot-instructions.md
 */

import {
  calculateOverdueMinutes,
  calculateTimeRemaining,
  getSeverity,
  getSeverityInfo,
  formatDuration,
  computeOverdueKpis,
  computeTotalOccupation,
  computeOccupationByParking,
  computeGlobalStats,
  groupOverdueTicketsByParking,
  exportRegularizedToCSV
} from '../overdue';

describe('overdue.js - Calculs de base', () => {
  describe('calculateOverdueMinutes', () => {
    test('calculateOverdueMinutes_vehicleNotOverdue_returns0', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 10 * 60 * 1000); // Il y a 10 minutes
      
      const reservation = {
        startTime: start.toISOString(),
        duration: 30 // 30 minutes payées
      };

      expect(calculateOverdueMinutes(reservation)).toBe(0);
    });

    test('calculateOverdueMinutes_vehicleOverdue15min_returns15', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 45 * 60 * 1000); // Il y a 45 minutes
      
      const reservation = {
        startTime: start.toISOString(),
        duration: 30 // 30 minutes payées
      };

      const result = calculateOverdueMinutes(reservation);
      expect(result).toBeGreaterThanOrEqual(14);
      expect(result).toBeLessThanOrEqual(16);
    });

    test('calculateOverdueMinutes_missingData_returns0', () => {
      expect(calculateOverdueMinutes(null)).toBe(0);
      expect(calculateOverdueMinutes({})).toBe(0);
      expect(calculateOverdueMinutes({ startTime: null })).toBe(0);
    });

    test('calculateOverdueMinutes_invalidDate_returns0', () => {
      const reservation = {
        startTime: 'invalid-date',
        duration: 30
      };

      expect(calculateOverdueMinutes(reservation)).toBe(0);
    });
  });

  describe('calculateTimeRemaining', () => {
    test('calculateTimeRemaining_withTimeLeft_returnsRemainingFalse', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 10 * 60 * 1000);
      
      const reservation = {
        startTime: start.toISOString(),
        duration: 30
      };

      const result = calculateTimeRemaining(reservation);
      expect(result.isOverdue).toBe(false);
      expect(result.remaining).toBeGreaterThanOrEqual(19);
      expect(result.remaining).toBeLessThanOrEqual(21);
    });

    test('calculateTimeRemaining_overdue_returnsRemainingTrue', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 45 * 60 * 1000);
      
      const reservation = {
        startTime: start.toISOString(),
        duration: 30
      };

      const result = calculateTimeRemaining(reservation);
      expect(result.isOverdue).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(14);
      expect(result.remaining).toBeLessThanOrEqual(16);
    });
  });

  describe('getSeverity', () => {
    test('getSeverity_0minutes_returnsNone', () => {
      expect(getSeverity(0)).toBe('none');
    });

    test('getSeverity_10minutes_returnsLight', () => {
      expect(getSeverity(10)).toBe('light');
    });

    test('getSeverity_20minutes_returnsLight', () => {
      expect(getSeverity(20)).toBe('light');
    });

    test('getSeverity_30minutes_returnsModerate', () => {
      expect(getSeverity(30)).toBe('moderate');
    });

    test('getSeverity_60minutes_returnsModerate', () => {
      expect(getSeverity(60)).toBe('moderate');
    });

    test('getSeverity_90minutes_returnsSevere', () => {
      expect(getSeverity(90)).toBe('severe');
    });
  });

  describe('getSeverityInfo', () => {
    test('getSeverityInfo_none_returnsGreenCheck', () => {
      const info = getSeverityInfo('none');
      expect(info.label).toBe('Normal');
      expect(info.emoji).toBe('✅');
      expect(info.color).toBe('green');
    });

    test('getSeverityInfo_light_returnsOrangeWarning', () => {
      const info = getSeverityInfo('light');
      expect(info.label).toBe('Léger');
      expect(info.emoji).toBe('⚠️');
      expect(info.color).toBe('orange');
    });

    test('getSeverityInfo_severe_returnsRedAlert', () => {
      const info = getSeverityInfo('severe');
      expect(info.label).toBe('Grave');
      expect(info.emoji).toBe('🚨');
      expect(info.color).toBe('red');
    });
  });

  describe('formatDuration', () => {
    test('formatDuration_0minutes_returns0min', () => {
      expect(formatDuration(0)).toBe('0min');
    });

    test('formatDuration_negativeMinutes_returns0min', () => {
      expect(formatDuration(-10)).toBe('0min');
    });

    test('formatDuration_45minutes_returns45min', () => {
      expect(formatDuration(45)).toBe('45min');
    });

    test('formatDuration_60minutes_returns1h', () => {
      expect(formatDuration(60)).toBe('1h');
    });

    test('formatDuration_90minutes_returns1h30min', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });

    test('formatDuration_125minutes_returns2h5min', () => {
      expect(formatDuration(125)).toBe('2h 5min');
    });
  });
});

describe('overdue.js - Agrégations KPI', () => {
  const createTicket = (id, status, startMinutesAgo, duration) => {
    const now = new Date();
    const start = new Date(now.getTime() - startMinutesAgo * 60 * 1000);
    
    return {
      id,
      status,
      startTime: start.toISOString(),
      duration,
      licencePlate: `TEST-${id}`,
      vehicleType: 'Voiture',
      parkingZone: 'République'
    };
  };

  describe('computeOverdueKpis', () => {
    test('computeOverdueKpis_emptyArray_returnsZeros', () => {
      const kpis = computeOverdueKpis([]);
      
      expect(kpis.activeOverdue).toBe(0);
      expect(kpis.signaled).toBe(0);
      expect(kpis.regularized).toBe(0);
      expect(kpis.averageOverdue).toBe(0);
      expect(kpis.totalOverdueMinutes).toBe(0);
    });

    test('computeOverdueKpis_mixedStatuses_returnsCorrectCounts', () => {
      const tickets = [
        createTicket(1, 'ACTIVE', 45, 30),    // En excès de ~15min
        createTicket(2, 'ACTIVE', 20, 30),    // Normal
        createTicket(3, 'SIGNALE', 60, 30),   // Signalé avec ~30min excès
        createTicket(4, 'COMPLETED', 90, 30), // Régularisé
        createTicket(5, 'ACTIVE', 75, 30)     // En excès de ~45min
      ];

      const kpis = computeOverdueKpis(tickets);
      
      expect(kpis.activeOverdue).toBe(2); // Tickets 1 et 5
      expect(kpis.signaled).toBe(1);      // Ticket 3
      expect(kpis.regularized).toBe(1);   // Ticket 4
      expect(kpis.totalOverdueMinutes).toBeGreaterThan(0);
    });

    test('computeOverdueKpis_onlyActiveNotOverdue_returns0activeOverdue', () => {
      const tickets = [
        createTicket(1, 'ACTIVE', 10, 30),
        createTicket(2, 'ACTIVE', 15, 30),
        createTicket(3, 'ACTIVE', 5, 30)
      ];

      const kpis = computeOverdueKpis(tickets);
      
      expect(kpis.activeOverdue).toBe(0);
      expect(kpis.signaled).toBe(0);
    });

    test('computeOverdueKpis_averageCalculation_correctValue', () => {
      const tickets = [
        createTicket(1, 'ACTIVE', 60, 30),  // ~30min excès
        createTicket(2, 'ACTIVE', 90, 30),  // ~60min excès
        createTicket(3, 'SIGNALE', 120, 30) // ~90min excès
      ];

      const kpis = computeOverdueKpis(tickets);
      
      // Moyenne doit être calculée sur tous les tickets en excès (active + signalés)
      expect(kpis.averageOverdue).toBeGreaterThan(0);
      expect(kpis.averageOverdue).toBeLessThan(100);
    });
  });

  describe('computeTotalOccupation', () => {
    test('computeTotalOccupation_emptyArray_returns0', () => {
      expect(computeTotalOccupation([])).toBe(0);
    });

    test('computeTotalOccupation_mixedStatuses_countsActiveAndSignale', () => {
      const tickets = [
        { status: 'ACTIVE' },
        { status: 'ACTIVE' },
        { status: 'SIGNALE' },
        { status: 'COMPLETED' },
        { status: 'CANCELLED' }
      ];

      expect(computeTotalOccupation(tickets)).toBe(3); // 2 ACTIVE + 1 SIGNALE
    });

    test('computeTotalOccupation_onlyCompleted_returns0', () => {
      const tickets = [
        { status: 'COMPLETED' },
        { status: 'COMPLETED' }
      ];

      expect(computeTotalOccupation(tickets)).toBe(0);
    });
  });

  describe('computeOccupationByParking', () => {
    test('computeOccupationByParking_emptyParkings_returnsEmpty', () => {
      const result = computeOccupationByParking([], []);
      expect(result).toEqual([]);
    });

    test('computeOccupationByParking_calculatesOccupationPerParking', () => {
      const tickets = [
        { ...createTicket(1, 'ACTIVE', 10, 30), parkingZone: 'République' },
        { ...createTicket(2, 'ACTIVE', 10, 30), parkingZone: 'République' },
        { ...createTicket(3, 'SIGNALE', 10, 30), parkingZone: 'Gare' },
        { ...createTicket(4, 'COMPLETED', 10, 30), parkingZone: 'République' }
      ];

      const parkings = [
        { name: 'République', capacity: 100 },
        { name: 'Gare', capacity: 50 },
        { name: 'Mairie', capacity: 75 }
      ];

      const result = computeOccupationByParking(tickets, parkings);
      
      expect(result).toHaveLength(3);
      
      const republique = result.find(p => p.name === 'République');
      expect(republique.occupation).toBe(2); // 2 ACTIVE (COMPLETED exclu)
      expect(republique.percentage).toBe(2);
      expect(republique.state).toBe('low');
      expect(republique.vehicles).toHaveLength(2);

      const gare = result.find(p => p.name === 'Gare');
      expect(gare.occupation).toBe(1); // 1 SIGNALE
      expect(gare.percentage).toBe(2);
    });

    test('computeOccupationByParking_stateThresholds_correctClassification', () => {
      const parkings = [
        { name: 'Low', capacity: 100 },
        { name: 'Medium', capacity: 100 },
        { name: 'High', capacity: 100 }
      ];

      const tickets = [
        ...Array(25).fill(null).map((_, i) => ({ ...createTicket(i, 'ACTIVE', 10, 30), parkingZone: 'Low' })),
        ...Array(50).fill(null).map((_, i) => ({ ...createTicket(i + 25, 'ACTIVE', 10, 30), parkingZone: 'Medium' })),
        ...Array(75).fill(null).map((_, i) => ({ ...createTicket(i + 75, 'ACTIVE', 10, 30), parkingZone: 'High' }))
      ];

      const result = computeOccupationByParking(tickets, parkings);
      
      expect(result.find(p => p.name === 'Low').state).toBe('low');    // 25% < 30%
      expect(result.find(p => p.name === 'Medium').state).toBe('medium'); // 50% entre 30-70%
      expect(result.find(p => p.name === 'High').state).toBe('high');   // 75% > 70%
    });
  });

  describe('computeGlobalStats', () => {
    test('computeGlobalStats_emptyArray_returnsDefaultValues', () => {
      const stats = computeGlobalStats([], []);
      
      expect(stats.totalVehicles).toBe(0);
      expect(stats.totalCapacity).toBe(0);
      expect(stats.globalPercentage).toBe(0);
      expect(stats.saturationIndex).toBe(0);
      expect(stats.mostFilledParking).toBeNull();
      expect(stats.distributionIndex).toBe(0);
    });

    test('computeGlobalStats_multipleParkings_aggregatesCorrectly', () => {
      const occupationByParking = [
        { name: 'P1', occupation: 50, capacity: 100, percentage: 50, vehicles: [] },
        { name: 'P2', occupation: 30, capacity: 100, percentage: 30, vehicles: [] },
        { name: 'P3', occupation: 80, capacity: 100, percentage: 80, vehicles: [] }
      ];

      // Simuler 160 tickets ACTIVE/SIGNALE
      const allTickets = [
        ...Array(50).fill({ status: 'ACTIVE' }),
        ...Array(30).fill({ status: 'ACTIVE' }),
        ...Array(80).fill({ status: 'SIGNALE' })
      ];

      const stats = computeGlobalStats(occupationByParking, allTickets);
      
      expect(stats.totalVehicles).toBe(160);
      expect(stats.totalCapacity).toBe(300);
      expect(stats.globalPercentage).toBe(53); // Math.round(160/300*100)
      expect(stats.saturationIndex).toBe(53); // Math.round((50+30+80)/3)
      expect(stats.mostFilledParking.name).toBe('P3');
      expect(stats.distributionIndex).toBeGreaterThan(0);
      expect(stats.distributionIndex).toBeLessThanOrEqual(100);
    });

    test('computeGlobalStats_perfectDistribution_highDistributionIndex', () => {
      const occupationByParking = [
        { name: 'P1', occupation: 50, capacity: 100, percentage: 50, vehicles: [] },
        { name: 'P2', occupation: 50, capacity: 100, percentage: 50, vehicles: [] },
        { name: 'P3', occupation: 50, capacity: 100, percentage: 50, vehicles: [] }
      ];

      const allTickets = Array(150).fill({ status: 'ACTIVE' });

      const stats = computeGlobalStats(occupationByParking, allTickets);
      
      expect(stats.distributionIndex).toBe(100); // Écart-type = 0 → parfaitement équilibré
    });
  });

  describe('groupOverdueTicketsByParking', () => {
    test('groupOverdueTicketsByParking_emptyArray_returnsEmpty', () => {
      const groups = groupOverdueTicketsByParking([]);
      expect(groups).toEqual([]);
    });

    test('groupOverdueTicketsByParking_onlyNormalTickets_returnsEmpty', () => {
      const tickets = [
        createTicket(1, 'ACTIVE', 10, 30), // Normal
        createTicket(2, 'ACTIVE', 15, 30)  // Normal
      ];

      const groups = groupOverdueTicketsByParking(tickets);
      expect(groups).toEqual([]);
    });

    test('groupOverdueTicketsByParking_mixedTickets_groupsOverdueOnly', () => {
      const tickets = [
        { ...createTicket(1, 'ACTIVE', 45, 30), parkingZone: 'République' },  // En excès
        { ...createTicket(2, 'ACTIVE', 10, 30), parkingZone: 'République' },  // Normal
        { ...createTicket(3, 'SIGNALE', 60, 30), parkingZone: 'Gare' },      // Signalé
        { ...createTicket(4, 'ACTIVE', 75, 30), parkingZone: 'Gare' }        // En excès
      ];

      const groups = groupOverdueTicketsByParking(tickets);
      
      expect(groups).toHaveLength(2);
      
      const gareGroup = groups.find(g => g.parkingName === 'Gare');
      expect(gareGroup.count).toBe(2);
      expect(gareGroup.tickets).toHaveLength(2);
    });

    test('groupOverdueTicketsByParking_sortsByParkingWithMostInfractions', () => {
      const tickets = [
        { ...createTicket(1, 'ACTIVE', 45, 30), parkingZone: 'P1' },
        { ...createTicket(2, 'SIGNALE', 60, 30), parkingZone: 'P2' },
        { ...createTicket(3, 'SIGNALE', 60, 30), parkingZone: 'P2' },
        { ...createTicket(4, 'SIGNALE', 60, 30), parkingZone: 'P2' }
      ];

      const groups = groupOverdueTicketsByParking(tickets);
      
      expect(groups[0].parkingName).toBe('P2'); // 3 infractions
      expect(groups[1].parkingName).toBe('P1'); // 1 infraction
    });
  });
});

describe('overdue.js - Export CSV', () => {
  describe('exportRegularizedToCSV', () => {
    test('exportRegularizedToCSV_emptyHistory_returnsHeadersOnly', () => {
      const csv = exportRegularizedToCSV([]);
      
      expect(csv).toContain('Plaque,Type,Parking,Durée Excès,Date Régularisation');
      expect(csv.split('\n')).toHaveLength(1);
    });

    test('exportRegularizedToCSV_withData_returnsFormattedCSV', () => {
      const history = [
        {
          licencePlate: 'AB-123-CD',
          vehicleType: 'Voiture',
          parkingZone: 'République',
          startTime: new Date('2025-10-24T10:00:00').toISOString(),
          duration: 30,
          endTime: new Date('2025-10-24T11:15:00').toISOString()
        }
      ];

      const csv = exportRegularizedToCSV(history);
      
      expect(csv).toContain('AB-123-CD');
      expect(csv).toContain('Voiture');
      expect(csv).toContain('République');
    });

    test('exportRegularizedToCSV_multipleRows_correctLineCount', () => {
      const history = [
        {
          licencePlate: 'TEST-1',
          vehicleType: 'Voiture',
          parkingZone: 'P1',
          startTime: new Date().toISOString(),
          duration: 30,
          endTime: new Date().toISOString()
        },
        {
          licencePlate: 'TEST-2',
          vehicleType: 'Moto',
          parkingZone: 'P2',
          startTime: new Date().toISOString(),
          duration: 30,
          endTime: new Date().toISOString()
        }
      ];

      const csv = exportRegularizedToCSV(history);
      const lines = csv.split('\n');
      
      expect(lines).toHaveLength(3); // Header + 2 rows
    });
  });
});

describe('overdue.js - Edge Cases', () => {
  test('calculateOverdueMinutes_futureStartTime_returns0', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000); // +1 heure
    const reservation = {
      startTime: future.toISOString(),
      duration: 30
    };

    expect(calculateOverdueMinutes(reservation)).toBe(0);
  });

  test('computeOverdueKpis_nullInput_returnsZeros', () => {
    const kpis = computeOverdueKpis(null);
    
    expect(kpis.activeOverdue).toBe(0);
    expect(kpis.signaled).toBe(0);
  });

  test('formatDuration_veryLargeDuration_formatsCorrectly', () => {
    expect(formatDuration(1440)).toBe('24h'); // 1 jour
    expect(formatDuration(1500)).toBe('25h'); // Plus de 24h
  });

  test('computeOccupationByParking_capacityZero_handlesGracefully', () => {
    const tickets = [
      { status: 'ACTIVE', parkingZone: 'Test' }
    ];

    const parkings = [
      { name: 'Test', capacity: 0 }
    ];

    const result = computeOccupationByParking(tickets, parkings);
    
    expect(result[0].percentage).toBe(0);
  });
});
