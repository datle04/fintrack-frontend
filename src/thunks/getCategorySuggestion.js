import axios from "axios";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

export const getCategorySuggestion = async (type, note, token) => {
  try {
    const res = await axios.post(
      `${BACK_END_URL}/api/transaction/categories/suggest`,
      { type, note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.suggestedCategory;
  } catch (error) {
    console.error("Something went wrong getting category suggestion!", error);
  }
};

export default getCategorySuggestion;