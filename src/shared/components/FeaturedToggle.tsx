'use client';

import { useTransition, useState } from 'react';
import { Star } from 'lucide-react';
import { toggleFeaturedStatus } from "@/features/products/actions";

interface FeaturedToggleProps {
    productId: string;
    initialFeatured: boolean;
}

export default function FeaturedToggle({ productId, initialFeatured }: FeaturedToggleProps) {
    const [isPending, startTransition] = useTransition();
    // Optimistic UI state
    const [featured, setFeatured] = useState(initialFeatured);

    const handleToggle = () => {
        // Immediate visual feedback (optimistic update)
        const newStatus = !featured;
        setFeatured(newStatus);

        startTransition(async () => {
            try {
                const result = await toggleFeaturedStatus(productId, featured);
                if (!result.success) {
                    // Revert on error
                    setFeatured(featured);
                    console.error(result.error);
                    alert('Failed to update featured status');
                }
            } catch (error) {
                setFeatured(featured);
                console.error(error);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 ${featured
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
            title={featured ? 'Remove from Featured' : 'Add to Featured'}
        >
            <Star
                size={18}
                className={`transition-transform duration-200 ${featured ? 'fill-current scale-110' : 'scale-100'
                    } ${isPending ? 'animate-pulse' : ''}`}
            />
        </button>
    );
}
