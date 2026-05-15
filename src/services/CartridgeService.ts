import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cartridge } from '../features/cartridge/types';
import { STORAGE_KEYS, CARTRIDGE_SCHEMA_VERSION } from '../constants';

// Cartuchos bundlados (oficiais que vêm com o app)
const BUNDLED_CARTRIDGES: Record<string, Cartridge> = {
  'elite-futebol': require('../data/cartridge-elite-futebol.json') as Cartridge,
};

class CartridgeService {
  /**
   * Retorna todos os cartuchos disponíveis (bundlados + instalados pelo usuário)
   */
  async getAll(): Promise<Cartridge[]> {
    const bundled = Object.values(BUNDLED_CARTRIDGES);
    const installed = await this.getInstalled();
    return [...bundled, ...installed];
  }

  /**
   * Retorna um cartucho por ID
   */
  async getById(id: string): Promise<Cartridge | null> {
    // Busca nos bundlados primeiro
    const bundled = Object.values(BUNDLED_CARTRIDGES).find(
      c => c.cartridge.id === id
    );
    if (bundled) return bundled;

    // Busca nos instalados
    const installed = await this.getInstalled();
    return installed.find(c => c.cartridge.id === id) ?? null;
  }

  /**
   * Retorna cartuchos instalados pelo usuário (piratas/trainers)
   */
  async getInstalled(): Promise<Cartridge[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CARTRIDGES);
      return raw ? (JSON.parse(raw) as Cartridge[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Instala um cartucho externo (pirata ou trainer)
   */
  async install(cartridge: Cartridge): Promise<void> {
    this.validate(cartridge); // lança se inválido
    const installed = await this.getInstalled();
    const exists = installed.findIndex(c => c.cartridge.id === cartridge.cartridge.id);

    if (exists >= 0) {
      installed[exists] = cartridge; // atualiza se já existe
    } else {
      installed.push(cartridge);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CARTRIDGES, JSON.stringify(installed));
  }

  /**
   * Remove um cartucho instalado
   */
  async uninstall(id: string): Promise<void> {
    const installed = await this.getInstalled();
    const filtered = installed.filter(c => c.cartridge.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CARTRIDGES, JSON.stringify(filtered));
  }

  /**
   * Valida se um JSON é um cartucho válido
   * Lança erro descritivo se inválido — útil para cartuchos piratas
   */
  validate(data: unknown): asserts data is Cartridge {
    if (!data || typeof data !== 'object') {
      throw new Error('Cartucho inválido: não é um objeto JSON válido.');
    }

    const c = data as Record<string, unknown>;

    if (!c.$schema || typeof c.$schema !== 'string') {
      throw new Error('Cartucho inválido: campo $schema ausente.');
    }

    if (!c.cartridge || typeof c.cartridge !== 'object') {
      throw new Error('Cartucho inválido: campo cartridge ausente.');
    }

    const inner = c.cartridge as Record<string, unknown>;

    if (!inner.id || !inner.version || !inner.meta || !Array.isArray(inner.programs)) {
      throw new Error('Cartucho inválido: estrutura incompleta (id, version, meta ou programs ausentes).');
    }

    if (!Array.isArray(inner.programs) || inner.programs.length === 0) {
      throw new Error('Cartucho inválido: nenhuma ficha de treino encontrada.');
    }
  }
}

// Singleton — uma instância para todo o app
export const cartridgeService = new CartridgeService();
