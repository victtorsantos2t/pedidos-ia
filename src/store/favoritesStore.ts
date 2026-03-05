import { Product } from "@/lib/services/catalogService";

export interface FavoritesStore {
    favoriteIds: string[];
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favoriteIds: [],
            toggleFavorite: (productId) => {
                const current = get().favoriteIds;
                const exists = current.includes(productId);

                if (exists) {
                    set({ favoriteIds: current.filter(id => id !== productId) });
                } else {
                    set({ favoriteIds: [...current, productId] });
                }
            },
            isFavorite: (productId) => {
                return get().favoriteIds.includes(productId);
            },
        }),
        {
            name: "rdos-favorites-storage",
        }
    )
);
