export const uploadMediaFlow = async ({ payload, api }) => {
  // Simulate file upload to S3/Cloudflare
  // In a real app, this would use FormData and progress tracking
  const response = await api.post("/media/upload", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response;
};

export const submitUploaderFlow = async ({ payload, api }) => {
  const response = await api.post("/media/submit", payload);
  return response;
};
