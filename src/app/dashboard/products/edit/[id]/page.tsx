"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductForm } from "@/features/products/hooks/useProductForm";
import ProductForm from "@/features/products/components/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const productId = params?.id || null;

  const productForm = useProductForm({ productId });

  if (productForm.isInitialLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      {...productForm}
      isEditMode={true}
      onCancel={() => router.push('/dashboard/products')}
    />
  );
}
