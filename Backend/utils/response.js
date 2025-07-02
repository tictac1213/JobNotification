export const APIResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({
    success,
    message,
    data
  });
};
