import { message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/http"; // ⚠️ đảm bảo path đúng

// =======================
// GET LIST
// =======================
export const useListCategory = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await apiClient.get("/category");
      return res.data.data; // ✅ đúng format backend
    },
  });
};

// =======================
// CREATE
// =======================
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const res = await apiClient.post("/category", values);
      return res.data;
    },

    onSuccess: () => {
      message.success("Thêm thành công");
      queryClient.invalidateQueries({ queryKey: ["category"] });
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

// =======================
// UPDATE
// =======================
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string | number;
      values: any;
    }) => {
      const res = await apiClient.put(`/category/${id}`, values);
      return res.data;
    },

    onSuccess: () => {
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["category"] });
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

// =======================
// DELETE
// =======================
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await apiClient.delete(`/category/${id}`);
      return res.data;
    },

    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },

    onError: () => {
      message.error("Xóa thất bại");
    },
  });
};
