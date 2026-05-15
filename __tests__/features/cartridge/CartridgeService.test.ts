import { cartridgeService } from '../../../src/services/CartridgeService';

describe('CartridgeService.validate', () => {
  it('aceita um cartucho válido', () => {
    const valid = {
      $schema: 'https://gameboy.fit/cartridge/v1',
      cartridge: {
        id: 'test-001',
        version: '1.0.0',
        type: 'official',
        meta: { title: 'Test', author: 'Test', author_type: 'official', sport_focus: [], description: '', cover: {}, tags: [], created_at: '', weeks: 4, sessions_per_week: 3 },
        programs: [{ id: 'p1', label: 'A', title: 'Test', focus: '', duration_min: 30, muscle_groups: [], sections: [] }],
      },
    };
    expect(() => cartridgeService.validate(valid)).not.toThrow();
  });

  it('rejeita objeto sem $schema', () => {
    const invalid = { cartridge: { id: 'x', version: '1', meta: {}, programs: [{}] } };
    expect(() => cartridgeService.validate(invalid)).toThrow('$schema');
  });

  it('rejeita cartucho sem programs', () => {
    const invalid = {
      $schema: 'https://gameboy.fit/cartridge/v1',
      cartridge: { id: 'x', version: '1', meta: {}, programs: [] },
    };
    expect(() => cartridgeService.validate(invalid)).toThrow();
  });

  it('rejeita null', () => {
    expect(() => cartridgeService.validate(null)).toThrow();
  });
});
