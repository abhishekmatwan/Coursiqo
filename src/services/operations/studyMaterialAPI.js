import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { studyMaterialEndpoints } from "../apis";

const {
  CREATE_STUDY_MATERIAL_API,
  DELETE_STUDY_MATERIAL_API,
} = studyMaterialEndpoints;

export const addStudyMaterial = async (formData, token) => {
  const toastId = toast.loading("Uploading study material...");
  let result = null;
  try {
    const response = await apiConnector(
      "POST",
      CREATE_STUDY_MATERIAL_API,
      formData,
      {
        "Content-Type": "multipart/form-data",
        Authorisation: `Bearer ${token}`,
      }
    );
    console.log("CREATE_STUDY_MATERIAL_API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could not add study material");
    }
    toast.success("Study material added!");
    result = response.data.data;
  } catch (error) {
    console.log("CREATE_STUDY_MATERIAL_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const removeStudyMaterial = async (
  { studyMaterialId, subSectionId, courseId },
  token
) => {
  const toastId = toast.loading("Removing study material...");
  let result = null;
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_STUDY_MATERIAL_API,
      { studyMaterialId, subSectionId, courseId },
      {
        Authorisation: `Bearer ${token}`,
      }
    );
    console.log("DELETE_STUDY_MATERIAL_API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could not remove study material");
    }
    toast.success("Study material removed");
    result = response.data.data;
  } catch (error) {
    console.log("DELETE_STUDY_MATERIAL_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};
