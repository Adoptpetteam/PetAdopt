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
    onError: () => {
      message.error("Xóa thất bại");
    },
  });
};

export const useCreateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => getCreateCategory({ resource, values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat().join("\n");
        message.error(messages);
      } else {
        message.error("Thêm thất bại");
      }
    },
  });
};

export const useUpdateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: number | string; values: any }) =>
      getUpdateCategory({ resource, id, values }),
    onSuccess: () => {
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat().join("\n");
        message.error(messages);
      } else {
        message.error("Cập nhật thất bại");
      }
    },
  });
};

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
    onSuccess: () => {
      message.success("Thêm thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => message.error("Thêm thú cưng thất bại"),
  });
};

export const useUpdatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: any }) =>
      updatePet({ resource, id, values }),
    onSuccess: () => {
      message.success("Cập nhật thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => message.error("Cập nhật thú cưng thất bại"),
  });
};

export const useDeletePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deletePet({ resource, id }),
    onSuccess: () => {
      message.success("Xóa thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => message.error("Xóa thú cưng thất bại"),
  });
};

export const useCreateAdoption = ({ resource = "adoptions" }: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createAdoption({ resource, values }),
    onSuccess: () => {
      message.success("Gửi form thành công!");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => {
      message.error("Gửi form thất bại");
    },
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
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => {
      message.error("Xóa thất bại");
    },
  });
};
