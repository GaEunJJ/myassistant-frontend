import apiClient from "./client";

interface UploadResponse {
  message: string;
}

/**
 * 문서 파일을 업로드한다. 인덱싱은 백그라운드에서 비동기 처리된다.
 *
 * @param file 업로드할 파일
 * @returns 업로드 결과 메시지
 */
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadResponse>("/api/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
