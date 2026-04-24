import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

import type { Pet } from "../data/pet"

// lấy danh sách
export const useListCategory = ({ resource = "category" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListCategory({ resource }),
  });
};

// xóa
export const useDeleteCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string | number) =>
      getDeleteCategory({ resource, id }),

    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: () => {
      message.error("Xóa thất bại");
    },
  });
};

// thêm
export const useCreateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) =>
      getCreateCategory({ resource, values }),

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

// cập nhật
export const useUpdateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number | string;
      values: any;
    }) => getUpdateCategory({ resource, id, values }),

    onSuccess: () => {
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: (error: any) => {
      console.error("Update error:", error.response?.data || error);

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

// ** Tùng **

// PETS
// Lấy danh sách thú cưng
export const useListPet = ({ resource = "pets" }: Props) => {
  return useQuery<Pet[]>({
    queryKey: [resource],
    queryFn: () => getListPet({ resource }),
  });
};

// Chi tiết thú cưng
export const usePetDetail = ({ resource = "pets", id }: any) => {
  return useQuery<Pet>({
    queryKey: [resource, id],
    queryFn: () => getPetDetail({ resource, id }),
    enabled: !!id, // chỉ call khi có id
  });
};



// Adoption
export const useCreateAdoption = ({ resource = "adoptions" }: any) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: any) =>
      createAdoption({ resource, values }),

    onSuccess: () => {
      message.success("Gửi form thành công!")
      queryClient.invalidateQueries({ queryKey: [resource] })
    },

    onError: () => {
      message.error("Gửi form thất bại")
    },
  })
}

// Admin Adoption
// lấy danh sách
export const useListAdoption = ({ resource = "adoptions" }: any) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListAdoption({ resource }),
  })
}

// xóa
export const useDeleteAdoption = ({ resource = "adoptions" }: any) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      deleteAdoption({ resource, id }),

    onSuccess: () => {
      message.success("Xóa thành công")
      queryClient.invalidateQueries({ queryKey: [resource] })
    },

    onError: () => {
      message.error("Xóa thất bại")
    },
  })
}

// CREATE
export const useCreatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createPet({ resource, values }),
    onSuccess: () => {
      message.success("Thêm thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
};

// UPDATE
export const useUpdatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: any) =>
      updatePet({ resource, id, values }),
    onSuccess: () => {
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
};

// DELETE
export const useDeletePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      deletePet({ resource, id }),
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
};