// 이메일 허용 문자: 영문/숫자/@/./_/- 만 허용
export const EMAIL_ALLOWED_CHAR_REGEX = /^[A-Za-z0-9@._-]+$/;
// 비밀번호 허용 문자: 영문/숫자 + 지정 특수문자만 허용
export const PASSWORD_ALLOWED_CHAR_REGEX = /^[A-Za-z0-9!@#$%^&*()_+\-={}\[\];':"\\|,.<>/?]+$/;
// 닉네임 허용 문자: 한글 또는 영문만 허용
export const NICKNAME_ALLOWED_CHAR_REGEX = /^[A-Za-z가-힣]+$/;
// 생년월일 형식: YYYY.MM.DD
export const BIRTH_DATE_REGEX = /^\d{4}\.\d{2}\.\d{2}$/;
