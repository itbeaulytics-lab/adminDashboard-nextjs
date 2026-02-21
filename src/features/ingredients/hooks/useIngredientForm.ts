import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "@/features/ingredients/types";
import { createClientClient } from "@/lib/supabaseClient";

export function useIngredientForm(initialData?: Ingredient) {
    const router = useRouter();
    const supabase = createClientClient();
    const isEdit = !!initialData;

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        benefits: initialData?.benefits || "",
        safety_level: initialData?.safety_level || "Aman",
    });

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData((prev) => {
            const newData = { ...prev, name: newName };
            if (!isEdit) {
                newData.slug = newName.toLowerCase().replace(/\s+/g, "-");
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                const { error } = await supabase
                    .from("ingredients")
                    .update(formData)
                    .eq("id", initialData!.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("ingredients")
                    .insert([formData]);
                if (error) throw error;
            }

            setSuccessMsg("Kandungan berhasil disimpan!");
            setTimeout(() => {
                router.push("/dashboard/ingredients");
                router.refresh();
            }, 1000);
        } catch (error: any) {
            console.error("Error saving ingredient:", error.message);
            alert("Gagal menyimpan kandungan.");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        loading,
        successMsg,
        handleNameChange,
        handleSubmit,
        isEdit,
        router,
    };
}
