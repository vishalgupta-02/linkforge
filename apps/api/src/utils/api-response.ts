type ApiResponseProp<T = null> = {
  success: true;
  message: string;
  data: T | null;
  statusCode: number;
};

export const ApiResponse = <T>(
  data: T,
  message = "Success",
  statusCode = 200,
): ApiResponseProp<T> => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};
