import axios from "axios";
import { useSelector } from "react-redux";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

export const getCategorySuggestion = async (type, note, token) => {
  try {
    const res = await axios.post(
      `${BACK_END_URL}/api/transaction/categories/suggestion`,
      { type, note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.category; // cũng bị sai chỗ này, dưới tớ nói kỹ
  } catch (error) {
    console.error("Something went wrong getting category suggestion!", error);
  }
};

export default getCategorySuggestion;