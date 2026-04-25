import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdoption,
  createPet,
  deleteAdoption,
  deletePet,
  getCreateCategory,
  getDeleteCategory,
  getListAdoption,
  getListCategory,
  getListPet,
  getPetDetail,
  getUpdateCategory,
  updatePet,
  type Props,
} from "../provider/huyProvider";
import type { Pet } from "../data/pet";

// ================= CATEGORY =================
export const useListCategory = ({ resource = "category" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListCategory({ resource }),
  });
};

export const useDeleteCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string | number) => getDeleteCategory({ resource, id }),
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => message.error("Xóa thất bại"),
  });
};

export const useCreateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => getCreateCategory({ resource, values }),
    onSuccess: (newCategory) => {
      // 🔥 update realtime
      queryClient.setQueryData([resource], (old: any) => [
        ...(old || []),
        newCategory,
      ]);
      message.success("Thêm danh mục thành công");
    },
    onError: () => message.error("Thêm thất bại"),
  });
};

export const useUpdateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: number | string; values: any }) =>
      getUpdateCategory({ resource, id, values }),
    onSuccess: (updated) => {
      queryClient.setQueryData([resource], (old: any) =>
        old.map((item: any) =>
          item.id === updated.id ? updated : item
        )
      );
      message.success("Cập nhật thành công");
    },
    onError: () => message.error("Cập nhật thất bại"),
  });
};

// ================= PET =================
export const useListPet = ({ resource = "pets" }: Props) => {
  return useQuery<Pet[]>({
    queryKey: [resource],
    queryFn: () => getListPet({ resource }),
  });
};

export const usePetDetail = ({ resource = "pets", id }: any) => {
  return useQuery<Pet>({
    queryKey: [resource, id],
    queryFn: () => getPetDetail({ resource, id }),
    enabled: !!id,
  });
};

export const useCreatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createPet({ resource, values }),

    onSuccess: (newPet) => {
      // 🔥 thêm ngay vào list (KHÔNG reload)
      queryClient.setQueryData([resource], (old: any) => [
        ...(old || []),
        newPet,
      ]);

      message.success("Thêm thú cưng thành công");
    },

    onError: () => message.error("Thêm thú cưng thất bại"),
  });
};

export const useUpdatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: any }) =>
      updatePet({ resource, id, values }),

    onSuccess: (updatedPet) => {
      queryClient.setQueryData([resource], (old: any) =>
        old.map((item: any) =>
          item.id === updatedPet.id ? updatedPet : item
        )
      );

      message.success("Cập nhật thú cưng thành công");
    },

    onError: () => message.error("Cập nhật thất bại"),
  });
};

export const useDeletePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deletePet({ resource, id }),

    onSuccess: (_, id) => {
      queryClient.setQueryData([resource], (old: any) =>
        old.filter((item: any) => item.id !== id)
      );

      message.success("Xóa thú cưng thành công");
    },

    onError: () => message.error("Xóa thất bại"),
  });
};

// ================= ADOPTION =================
export const useCreateAdoption = ({ resource = "adoptions" }: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createAdoption({ resource, values }),

    onSuccess: (newData) => {
      queryClient.setQueryData([resource], (old: any) => [
        ...(old || []),
        newData,
      ]);

      message.success("Gửi form thành công!");
    },

    onError: () => message.error("Gửi form thất bại"),
  });
};

export const useListAdoption = ({ resource = "adoptions" }: any) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListAdoption({ resource }),
  });
};

export const useDeleteAdoption = ({ resource = "adoptions" }: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteAdoption({ resource, id }),

    onSuccess: (_, id) => {
      queryClient.setQueryData([resource], (old: any) =>
        old.filter((item: any) => item.id !== id)
      );

      message.success("Xóa thành công");
    },

    onError: () => message.error("Xóa thất bại"),
  });
};