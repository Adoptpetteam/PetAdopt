import { message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListResource,
  getResourceDetail,
  createResource,
  updateResource,
  deleteResource,
  type Props,
} from "../provider/huyProvider";

export const useListCategory = ({ resource = "category" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListResource({ resource }),
  });
};

export const useCreateCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createResource({ resource, values }),

    onSuccess: () => {
      message.success("Thêm thành công");
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
    mutationFn: ({
      id,
      values,
    }: {
      id: number | string;
      values: any;
    }) => updateResource({ resource, id, values }),

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

export const useDeleteCategory = ({ resource = "category" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string | number) => deleteResource({ resource, id }),

    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: () => {
      message.error("Xóa thất bại");
    },
  });
};

export const useListPet = ({ resource = "pets" }: Props) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListResource({ resource }),
  });
};

export const useCreatePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createResource({ resource, values }),

    onSuccess: () => {
      message.success("Thêm thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat().join("\n");
        message.error(messages);
      } else {
        message.error("Thêm thú cưng thất bại");
      }
    },
  });
};

export const usePetDetail = ({ resource = "pets", id }: Props) => {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => getResourceDetail({ resource, id }),
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
    }) => updateResource({ resource, id, values }),

    onSuccess: () => {
      message.success("Cập nhật thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat().join("\n");
        message.error(messages);
      } else {
        message.error("Cập nhật thú cưng thất bại");
      }
    },
  });
};

export const useDeletePet = ({ resource = "pets" }: Props) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string | number) => deleteResource({ resource, id }),

    onSuccess: () => {
      message.success("Xóa thú cưng thành công");
      queryClient.invalidateQueries({ queryKey: [resource] });
    },

    onError: () => {
      message.error("Xóa thú cưng thất bại");
    },
  });
};
