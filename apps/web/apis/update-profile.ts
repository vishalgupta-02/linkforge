import axios from "axios";
import type { UpdateProfilePayload } from "@vyrex/types";

export type UpdateProfileParams = UpdateProfilePayload;

export async function updateUserProfile(data: UpdateProfileParams) {
  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/profile`,
    data,
    { withCredentials: true },
  );

  if (!res.data) {
    throw new Error("Failed to update profile");
  }

  return res.data;
}

export async function changeUsernameApi(username: string) {
  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/profile/username`,
    { username },
    { withCredentials: true },
  );

  if (!res.data) {
    throw new Error("Failed to update username");
  }

  return res.data;
}

export async function uploadAvatarImage(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/uploads`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  if (!res.data || !res.data.success) {
    throw new Error(res.data?.message || "Failed to upload image");
  }

  return res.data.data as { public_id: string; url: string };
}
