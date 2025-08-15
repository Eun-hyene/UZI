-- 사용자 타입 필드 추가 마이그레이션
USE PPS_APP;

-- user_type 컬럼 추가 (BUYER가 기본값)
ALTER TABLE TB_users 
ADD COLUMN user_type ENUM('BUYER', 'SELLER') NOT NULL DEFAULT 'BUYER' 
AFTER gender;

-- 인덱스 추가
ALTER TABLE TB_users 
ADD KEY idx_user_type (user_type);

-- 기존 사용자들은 BUYER로 설정 (이미 DEFAULT 값으로 설정됨)
-- UPDATE TB_users SET user_type = 'BUYER' WHERE user_type IS NULL;
