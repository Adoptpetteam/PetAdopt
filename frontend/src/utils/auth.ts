export const getUsers = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: any[]) => {
  localStorage.setItem("users", JSON.stringify(users));
};

export const login = (email: string, password: string) => {
  const users = getUsers();
  return users.find(
    (u: any) => u.email === email && u.password === password
  );
};

export const register = (user: any) => {
  const users = getUsers();

  const exist = users.find((u: any) => u.email === user.email);
  if (exist) return { error: "Email đã tồn tại" };

  users.push(user);
  saveUsers(users);

  return { success: true };
};

export const logout = () => {
  localStorage.removeItem("user");
};