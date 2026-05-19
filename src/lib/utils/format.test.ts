import { describe, it, expect } from 'vitest';
import { shortAddress, formatBalance } from './format';

describe('Utilidades de Formateo', () => {
  it('Debe acortar una dirección Ethereum/Syscoin correctamente', () => {
    const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    expect(shortAddress(address)).toBe('0x71C7...976F');
  });

  it('Debe retornar string vacío si la dirección es vacía', () => {
    expect(shortAddress('')).toBe('');
  });

  it('Debe formatear un balance numérico flotante con decimales por defecto', () => {
    expect(formatBalance('12.345678')).toBe('12.3457');
  });

  it('Debe formatear un balance numérico flotante con N decimales especificados', () => {
    expect(formatBalance('12.345678', 2)).toBe('12.35');
    expect(formatBalance('0.000123', 5)).toBe('0.00012');
  });
});
