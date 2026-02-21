"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Ingredient } from "@/features/ingredients/types";
import IngredientForm from "@/features/ingredients/components/IngredientForm";
import { createClientClient } from "@/lib/supabaseClient";

export default function EditIngredientPage() {
    const params = useParams();
    const id = params.id as string;
    const [ingredient, setIngredient] = useState<Ingredient | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClientClient();

    useEffect(() => {
        if (id) {
            fetchIngredient();
        }
    }, [id]);

    const fetchIngredient = async () => {
        try {
            const { data, error } = await supabase
                .from("ingredients")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setIngredient(data);
        } catch (error) {
            console.error("Error fetching ingredient:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!ingredient) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Data kandungan tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Kandungan</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Ubah data kandungan produk.</p>
            </div>
            <IngredientForm initialData={ingredient} />
        </div>
    );
}
