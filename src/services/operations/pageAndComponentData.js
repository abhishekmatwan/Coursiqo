import {toast} from "react-hot-toast"
import { setProgress } from "../../slices/loadingBarSlice";
import { apiConnector } from '../apiConnector';
import { catalogData } from '../apis';

export const getCatalogaPageData = async(categoryId, dispatch) => {
  dispatch(setProgress(50));
  let result = [];
  try {
    const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, {
      categoryId: categoryId,
    });
    console.log("CATALOG PAGE DATA API RESPONSE....", response);

    if (!response.data.success)
      throw new Error("Could not Fetch Category page data");

    result = response?.data;
  } catch (error) {
    console.log("CATALOG PAGE DATA API ERROR....", error);
    // ── FIXED: only show the toast on real server errors (5xx), not empty categories ──
    const status = error?.response?.status;
    if (status && status >= 500) {
      toast.error("Could not load catalog data. Please try again.");
    }
    result = error.response?.data;
  }
  dispatch(setProgress(100));
  return result;
}
