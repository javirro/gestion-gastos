interface ApiResponseOptions {
  status: number;
  message: string;
  data?: unknown;
}

export function apiSuccess({ status, message, data }: ApiResponseOptions) {
  return Response.json(
    { status, error: false, message, data: data ?? null },
    { status }
  );
}

export function apiError({ status, message }: Omit<ApiResponseOptions, "data">) {
  return Response.json(
    { status, error: true, message, data: null },
    { status }
  );
}
