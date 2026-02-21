import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "@/features/ingredients/types";
import { createClientClient } from "@/lib/supabaseClient";

export function useIngredientsList() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientClient();

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const { data, error } = await supabase
                .from("ingredients")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setIngredients(data || []);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus kandungan ini?")) {
            try {
                const { error } = await supabase.from("ingredients").delete().eq("id", id);
                if (error) throw error;
                setIngredients(ingredients.filter((item) => item.id !== id));
                router.refresh();
            } catch (error) {
                console.error("Error deleting ingredient:", error);
                alert("Gagal menghapus kandungan");
            }
        }
    };

    return {
        ingredients,
        loading,
        handleDelete
    };
}
