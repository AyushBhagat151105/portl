import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { createBudgetSchema, type CreateBudgetFormData } from "../../../lib/form-schemas";

interface BudgetFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function BudgetFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: BudgetFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      title: "",
      allocatedAmount: "",
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        title: "",
        allocatedAmount: "",
      });
    }
  }, [visible, reset]);

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Allocate Budget"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save Budget"
    >
      <FormInput
        control={control}
        name="title"
        label="Budget Title"
        placeholder="e.g. Festival Season 2026"
      />
      <FormInput
        control={control}
        name="allocatedAmount"
        label="Allocated Amount (INR)"
        placeholder="e.g. 50000"
        keyboardType="numeric"
      />
    </FormModal>
  );
}
export default BudgetFormModal;
