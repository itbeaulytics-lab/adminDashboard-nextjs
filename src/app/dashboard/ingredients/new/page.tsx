import IngredientForm from "@/features/ingredients/components/IngredientForm";

export const metadata = {
    title: "Tambah Kandungan Baru | Dashboard",
};

export default function NewIngredientPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Kandungan Baru</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Masukkan data kandungan produk dengan lengkap.</p>
            </div>
            <IngredientForm />
        </div>
    );
}
