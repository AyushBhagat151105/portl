import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { createFestivalSchema, type CreateFestivalFormData } from "../../../lib/form-schemas";

interface FestivalFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFestivalFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function FestivalFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: FestivalFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateFestivalFormData>({
    resolver: zodResolver(createFestivalSchema),
    defaultValues: {
      name: "",
      description: "",
      budget: "",
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: "",
        description: "",
        budget: "",
      });
    }
  }, [visible, reset]);

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Plan Festival Event"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save Plan"
    >
      <FormInput
        control={control}
        name="name"
        label="Festival Name"
        placeholder="e.g. Diwali Festivities 2026"
      />
      <FormInput
        control={control}
        name="description"
        label="Description"
        placeholder="Details of celebration & events"
      />
      <FormInput
        control={control}
        name="budget"
        label="Allocate Budget (Optional)"
        placeholder="e.g. 20000 (auto-creates linked budget)"
        keyboardType="numeric"
      />
    </FormModal>
  );
}
export default FestivalFormModal;
