'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProductForm } from "@/features/products/hooks/useProductForm";
import ProductForm from "@/features/products/components/ProductForm";

export default function UploadProductPage() {
  const router = useRouter();
  const productForm = useProductForm();

  return (
    <ProductForm
      {...productForm}
      isEditMode={false}
      onCancel={() => router.push('/dashboard/products')}
    />
  );
}
