import dayjs from 'dayjs'; 

/**
 * So sánh và trả về các field thay đổi
 * @param initialValues Dữ liệu gốc từ API
 * @param formValues Dữ liệu hiện tại trên Form
 */
export const getDirtyValues = (initialValues, formValues) => {
  const changes = {};

  Object.keys(formValues).forEach((key) => {
    const original = initialValues[key];
    const current = formValues[key];

    if (key === 'date' || key === 'targetDate' || key === 'dob') {
       const date1 = dayjs(original).format('YYYY-MM-DD');
       const date2 = dayjs(current).format('YYYY-MM-DD');
       if (date1 !== date2) {
         changes[key] = current;
       }
       return;
    }

    if (Array.isArray(original) || Array.isArray(current)) {
      if (JSON.stringify(original) !== JSON.stringify(current)) {
        changes[key] = current;
      }
      return;
    }

    if (
        typeof original === 'number' && 
        typeof current === 'string' && 
        !isNaN(Number(current))
    ) {
        if (original === Number(current)) return; 
    }

    if (original !== current) {
      if ((original === null || original === undefined) && current === "") return;
    
      changes[key] = current;
    }
  });

  return changes;
};