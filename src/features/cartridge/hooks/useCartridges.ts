import { useState, useEffect } from 'react';
import { Cartridge } from '../types';
import { cartridgeService } from '../../../services';

export function useCartridges() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cartridgeService
      .getAll()
      .then(setCartridges)
      .catch(() => setError('Erro ao carregar cartuchos'))
      .finally(() => setLoading(false));
  }, []);

  return { cartridges, loading, error };
}

export function useCartridge(id: string) {
  const [cartridge, setCartridge] = useState<Cartridge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cartridgeService
      .getById(id)
      .then(setCartridge)
      .finally(() => setLoading(false));
  }, [id]);

  return { cartridge, loading };
}
