import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getPet, listMyPets, registerPet } from '../api/petsApi';
import type { PetDraft } from '../model/types';

export const petKeys = {
  mine: ['pets', 'mine'] as const,
  one: (id: string) => ['pets', id] as const,
};

export function useMyPets() {
  return useQuery({ queryKey: petKeys.mine, queryFn: () => listMyPets() });
}

export function usePet(id: string) {
  return useQuery({ queryKey: petKeys.one(id), queryFn: () => getPet(id) });
}

/** Registers a dog and refreshes the list, so "Mis perros" shows it right away. */
export function useRegisterPet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: PetDraft) => registerPet(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: petKeys.mine }),
  });
}
