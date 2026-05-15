import { formatTime, formatLoad } from '../../src/utils/format';

describe('formatTime', () => {
  it('formata 0 segundos', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formata 90 segundos como 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('formata 3600 como 60:00', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('formata 65 como 01:05', () => {
    expect(formatTime(65)).toBe('01:05');
  });
});

describe('formatLoad', () => {
  it('retorna "corporal" para null', () => {
    expect(formatLoad(null)).toBe('corporal');
  });

  it('remove decimal desnecessário', () => {
    expect(formatLoad(50)).toBe('50 kg');
  });

  it('mantém decimal quando necessário', () => {
    expect(formatLoad(27.5)).toBe('27.5 kg');
  });
});
