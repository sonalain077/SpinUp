/**
 * Tests unitaires pour les utilitaires de types de véhicules
 */

import { 
  VEHICLE_TYPES,
  getVehicleTypeIcon, 
  getVehicleTypeLabel,
  getVehicleTypeColor,
  getVehicleTypeDisplay,
  getVehicleTypeStats,
  getVehicleTypeOptions
} from '../vehicleTypes';

describe('vehicleTypes utilities', () => {
  
  describe('VEHICLE_TYPES constant', () => {
    test('VEHICLE_TYPES_hasAllRequiredTypes', () => {
      expect(VEHICLE_TYPES.CAR).toBe('CAR');
      expect(VEHICLE_TYPES.MOTORCYCLE).toBe('MOTORCYCLE');
      expect(VEHICLE_TYPES.BICYCLE).toBe('BICYCLE');
      expect(VEHICLE_TYPES.ELECTRIC_SCOOTER).toBe('ELECTRIC_SCOOTER');
    });
  });

  describe('getVehicleTypeIcon', () => {
    test('getVehicleTypeIcon_CAR_returnsCarEmoji', () => {
      expect(getVehicleTypeIcon('CAR')).toBe('🚗');
    });

    test('getVehicleTypeIcon_MOTORCYCLE_returnsMotorcycleEmoji', () => {
      expect(getVehicleTypeIcon('MOTORCYCLE')).toBe('🏍️');
    });

    test('getVehicleTypeIcon_BICYCLE_returnsBicycleEmoji', () => {
      expect(getVehicleTypeIcon('BICYCLE')).toBe('🚴');
    });

    test('getVehicleTypeIcon_ELECTRIC_SCOOTER_returnsScooterEmoji', () => {
      expect(getVehicleTypeIcon('ELECTRIC_SCOOTER')).toBe('🛴');
    });

    test('getVehicleTypeIcon_lowercase_returnsCorrectIcon', () => {
      expect(getVehicleTypeIcon('car')).toBe('🚗');
      expect(getVehicleTypeIcon('motorcycle')).toBe('🏍️');
    });

    test('getVehicleTypeIcon_unknownType_returnsDefaultIcon', () => {
      expect(getVehicleTypeIcon('UNKNOWN')).toBe('🚙');
      expect(getVehicleTypeIcon('')).toBe('🚙');
      expect(getVehicleTypeIcon(null)).toBe('🚙');
      expect(getVehicleTypeIcon(undefined)).toBe('🚙');
    });
  });

  describe('getVehicleTypeLabel', () => {
    test('getVehicleTypeLabel_CAR_returnsVoiture', () => {
      expect(getVehicleTypeLabel('CAR')).toBe('Voiture');
    });

    test('getVehicleTypeLabel_MOTORCYCLE_returnsMoto', () => {
      expect(getVehicleTypeLabel('MOTORCYCLE')).toBe('Moto');
    });

    test('getVehicleTypeLabel_BICYCLE_returnsVelo', () => {
      expect(getVehicleTypeLabel('BICYCLE')).toBe('Vélo');
    });

    test('getVehicleTypeLabel_ELECTRIC_SCOOTER_returnsTrottinette', () => {
      expect(getVehicleTypeLabel('ELECTRIC_SCOOTER')).toBe('Trottinette électrique');
    });

    test('getVehicleTypeLabel_withShortFlag_returnsShortLabel', () => {
      expect(getVehicleTypeLabel('ELECTRIC_SCOOTER', true)).toBe('Trottinette');
      expect(getVehicleTypeLabel('CAR', true)).toBe('Voiture');
    });

    test('getVehicleTypeLabel_unknownType_returnsOriginal', () => {
      expect(getVehicleTypeLabel('UNKNOWN')).toBe('UNKNOWN');
      expect(getVehicleTypeLabel('')).toBe('Véhicule');
      expect(getVehicleTypeLabel(null)).toBe('Véhicule');
    });

    test('getVehicleTypeLabel_caseInsensitive_works', () => {
      expect(getVehicleTypeLabel('car')).toBe('Voiture');
      expect(getVehicleTypeLabel('Car')).toBe('Voiture');
      expect(getVehicleTypeLabel('CAR')).toBe('Voiture');
    });
  });

  describe('getVehicleTypeColor', () => {
    test('getVehicleTypeColor_CAR_returnsBlue', () => {
      expect(getVehicleTypeColor('CAR')).toBe('#3B82F6');
    });

    test('getVehicleTypeColor_MOTORCYCLE_returnsRed', () => {
      expect(getVehicleTypeColor('MOTORCYCLE')).toBe('#EF4444');
    });

    test('getVehicleTypeColor_BICYCLE_returnsGreen', () => {
      expect(getVehicleTypeColor('BICYCLE')).toBe('#10B981');
    });

    test('getVehicleTypeColor_ELECTRIC_SCOOTER_returnsPurple', () => {
      expect(getVehicleTypeColor('ELECTRIC_SCOOTER')).toBe('#8B5CF6');
    });

    test('getVehicleTypeColor_unknownType_returnsDefaultGray', () => {
      expect(getVehicleTypeColor('UNKNOWN')).toBe('#6B7280');
      expect(getVehicleTypeColor('')).toBe('#6B7280');
      expect(getVehicleTypeColor(null)).toBe('#6B7280');
    });
  });

  describe('getVehicleTypeDisplay', () => {
    test('getVehicleTypeDisplay_CAR_returnsIconAndLabel', () => {
      expect(getVehicleTypeDisplay('CAR')).toBe('🚗 Voiture');
    });

    test('getVehicleTypeDisplay_MOTORCYCLE_returnsIconAndLabel', () => {
      expect(getVehicleTypeDisplay('MOTORCYCLE')).toBe('🏍️ Moto');
    });

    test('getVehicleTypeDisplay_withShort_returnsShortLabel', () => {
      expect(getVehicleTypeDisplay('ELECTRIC_SCOOTER', true)).toBe('🛴 Trottinette');
      expect(getVehicleTypeDisplay('ELECTRIC_SCOOTER', false)).toBe('🛴 Trottinette électrique');
    });
  });

  describe('getVehicleTypeStats', () => {
    test('getVehicleTypeStats_emptyArray_returnsAllZeros', () => {
      const stats = getVehicleTypeStats([]);
      
      expect(stats.CAR).toBe(0);
      expect(stats.MOTORCYCLE).toBe(0);
      expect(stats.BICYCLE).toBe(0);
      expect(stats.ELECTRIC_SCOOTER).toBe(0);
    });

    test('getVehicleTypeStats_mixedTypes_countsCorrectly', () => {
      const tickets = [
        { vehicleType: 'CAR' },
        { vehicleType: 'CAR' },
        { vehicleType: 'MOTORCYCLE' },
        { vehicleType: 'BICYCLE' },
        { vehicleType: 'CAR' },
        { vehicleType: 'ELECTRIC_SCOOTER' }
      ];

      const stats = getVehicleTypeStats(tickets);
      
      expect(stats.CAR).toBe(3);
      expect(stats.MOTORCYCLE).toBe(1);
      expect(stats.BICYCLE).toBe(1);
      expect(stats.ELECTRIC_SCOOTER).toBe(1);
    });

    test('getVehicleTypeStats_lowercaseTypes_countsCorrectly', () => {
      const tickets = [
        { vehicleType: 'car' },
        { vehicleType: 'Car' },
        { vehicleType: 'CAR' }
      ];

      const stats = getVehicleTypeStats(tickets);
      expect(stats.CAR).toBe(3);
    });

    test('getVehicleTypeStats_unknownTypes_ignored', () => {
      const tickets = [
        { vehicleType: 'CAR' },
        { vehicleType: 'UNKNOWN' },
        { vehicleType: '' },
        { vehicleType: null },
        { vehicleType: 'MOTORCYCLE' }
      ];

      const stats = getVehicleTypeStats(tickets);
      expect(stats.CAR).toBe(1);
      expect(stats.MOTORCYCLE).toBe(1);
      expect(stats.BICYCLE).toBe(0);
      expect(stats.ELECTRIC_SCOOTER).toBe(0);
    });

    test('getVehicleTypeStats_missingVehicleTypeField_doesNotCrash', () => {
      const tickets = [
        { licencePlate: 'AA-123-BB' },
        { vehicleType: 'CAR' }
      ];

      const stats = getVehicleTypeStats(tickets);
      expect(stats.CAR).toBe(1);
    });
  });

  describe('getVehicleTypeOptions', () => {
    test('getVehicleTypeOptions_returnsAllTypes', () => {
      const options = getVehicleTypeOptions();
      
      expect(options).toHaveLength(4);
      expect(options.map(o => o.value)).toEqual(['CAR', 'MOTORCYCLE', 'BICYCLE', 'ELECTRIC_SCOOTER']);
    });

    test('getVehicleTypeOptions_hasCompleteData', () => {
      const options = getVehicleTypeOptions();
      
      options.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('shortLabel');
        expect(option).toHaveProperty('icon');
        expect(option).toHaveProperty('color');
        
        // Vérifications de format
        expect(option.value).toBeTruthy();
        expect(option.label).toBeTruthy();
        expect(option.shortLabel).toBeTruthy();
        expect(option.icon).toMatch(/[\u{1F000}-\u{1F9FF}]/u); // Emoji Unicode
        expect(option.color).toMatch(/^#[0-9A-F]{6}$/i); // Code hex couleur
      });
    });

    test('getVehicleTypeOptions_CAR_hasCorrectData', () => {
      const options = getVehicleTypeOptions();
      const carOption = options.find(o => o.value === 'CAR');
      
      expect(carOption).toBeDefined();
      expect(carOption.label).toBe('Voiture');
      expect(carOption.icon).toBe('🚗');
      expect(carOption.color).toBe('#3B82F6');
    });

    test('getVehicleTypeOptions_MOTORCYCLE_hasCorrectData', () => {
      const options = getVehicleTypeOptions();
      const motoOption = options.find(o => o.value === 'MOTORCYCLE');
      
      expect(motoOption).toBeDefined();
      expect(motoOption.label).toBe('Moto');
      expect(motoOption.icon).toBe('🏍️');
      expect(motoOption.color).toBe('#EF4444');
    });

    test('getVehicleTypeOptions_canBeUsedInSelect', () => {
      const options = getVehicleTypeOptions();
      
      // Simuler l'utilisation dans un <select>
      const selectOptions = options.map(o => ({
        value: o.value,
        display: `${o.icon} ${o.label}`
      }));
      
      expect(selectOptions).toHaveLength(4);
      expect(selectOptions[0].display).toBe('🚗 Voiture');
    });
  });
});
