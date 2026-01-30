import apiInstance from "../../../Interceptor/interceptor";

export const getTimeSlot = async () => {
    const res = await apiInstance.get(`/getShippingTimeSlots`);
    return res;
  };

  export const createTimeSlot = async (data) => {
    const res = await apiInstance.post(`/shippingTimeSlots`, data, {});
    return res;
  };

  export const getHolidayTimeSlot = async () => {
    const res = await apiInstance.get(`/getHolidayTimeSlot`);
    return res;
  };

  export const createHolidayDateSlot = async (data) => {
    const res = await apiInstance.post(`/createHolidayDateSlot`, data, {});
    return res;
  };

  export const updateHolidayTimeSlot = async (id, data) => {
    return await apiInstance.put(`/editHolidayTimeSlot?id=${id}`, data);
  };

  export const deleteHolidayTimeSlot = async (id) => {
    const res = await apiInstance.delete(`/deleteHolidayTimeSlot?id=${id}`);
    return res;
  };
  