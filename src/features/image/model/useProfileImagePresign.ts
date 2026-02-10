import { useImageUpload } from "./useImageUpload";

/**
 * 프로필/회원가입 이미지 업로드 훅.
 * 내부적으로 공통 이미지 업로드 유틸(shared/api/imageUpload)을 사용한다.
 */
export const useProfileImageUpload = () => {
  return useImageUpload({ imageType: "USERS" });
};
