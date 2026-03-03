export interface ApiErrorBody {
  message: string;
  detail_code?: string;
}

export class ApiError extends Error {
  status: number;
  detail_code?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.detail_code = body.detail_code;
  }
}
