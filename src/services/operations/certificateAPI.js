// src/services/operations/certificateAPI.js

import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const CERTIFICATE_ENDPOINTS = {
  GENERATE: BASE_URL + "/certificate/generate",
  GET_MY_CERTIFICATES: BASE_URL + "/certificate/my-certificates",
};

export const generateCertificate = async (courseId, token) => {
  const toastId = toast.loading("Generating certificate...");
  let result = null;
  try {
    const response = await apiConnector(
      "POST",
      CERTIFICATE_ENDPOINTS.GENERATE,
      { courseId },
      { Authorisation: `Bearer ${token}` }
    );
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    toast.success("Certificate generated!");
    result = response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const getStudentCertificates = async (token) => {
  let result = [];
  try {
    const response = await apiConnector(
      "GET",
      CERTIFICATE_ENDPOINTS.GET_MY_CERTIFICATES,
      null,
      { Authorisation: `Bearer ${token}` }
    );
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_MY_CERTIFICATES ERROR", error);
  }
  return result;
};
