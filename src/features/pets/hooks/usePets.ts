import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getOwnPet, listMyPets, registerPet } from '../api/petsApi';
import type { PetDraft } from '../model/types';

export const petKeys = {
  mine: ['pets', 'mine'] as const,
};

export function useMyPets() {
  return useQuery({ queryKey: petKeys.mine, queryFn: () => listMyPets() });
}

/** Registers a dog and refreshes the list, so "Mis perros" shows it right away. */
export function useRegisterPet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: PetDraft) => registerPet(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: petKeys.mine }),
  });
}

/** One dog of the owner. */
export function useOwnPet(id: string) {
  return useQuery({
    queryKey: ['pets', 'detail', id] as const,
    queryFn: () => getOwnPet(id),
  });
}
