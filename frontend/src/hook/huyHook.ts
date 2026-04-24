import { message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCreateCategory,
  getDeleteCategory,
  getListCategory,
  getUpdateCategory,
  getCategoryDetail,
  type Props,
} from "../provider/huyProvider";

// lấy danh sách
export const useListCategory = ({ resource = "category" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListCategory({ resource }),
  });
};

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
// Pet hooks
export const useListPet = ({ resource = "pets" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListCategory({ resource }),
  });
};

export const useDeletePet = ({ resource = "pets" }: Props) => {
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

export const useCreatePet = ({ resource = "pets" }: Props) => {
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

export const usePetDetail = ({ resource = "pets", id }: Props) => {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => getCategoryDetail({ resource, id }),
    enabled: Boolean(id),
  });
};

export const useUpdatePet = ({ resource = "pets" }: Props) => {
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

export const useCreateAdoption = ({ resource = "adoptions" }: Props) => {
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
        message.error("Tạo yêu cầu nhận nuôi thất bại");
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