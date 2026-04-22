import axios from "axios";


//dùng khi mà có đường dẫn api từ back-end
// const axiosClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });


const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export type Props = {
  resource: string;
  id?: number | string;
  values?: any;
};

export const getListCategory = async ({resource = "category"} : Props) => {
  const {data} = await axiosClient.get(resource);
  return data
}
export const getCategoryDetail = async ({ id, resource = "category" }: Props) => {
  if (!id) throw new Error("Thiếu ID phim");
  const { data } = await axiosClient.get(`${resource}/${id}`);
  return data;
};


export const getDeleteCategory = async ({resource = "category" , id} : Props) => {
  if(!id) return;
  const {data} = await axiosClient.delete(`${resource}/${id}`)
  return data;
}

export const getCreateCategory = async ({ resource = "category", values }: Props) => {
  const { data } = await axiosClient.post(resource, values);
  return data;
};


export const getUpdateCategory = async ({ resource = "category", id, values }: Props) => {
  if (!id) return;

  // Trường hợp values là FormData (thường dùng khi có upload ảnh)
  if (values instanceof FormData) {
    values.append("_method", "PUT");
    const { data } = await axiosClient.post(`${resource}/${id}`, values, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }

  // TRƯỜNG HỢP CẦN THÊM: values là Object bình thường (JSON)
  // Sử dụng PUT hoặc PATCH tùy theo API của bạn
  const { data } = await axiosClient.put(`${resource}/${id}`, values); 
  return data;
};