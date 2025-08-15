-- Charset / Collation
DROP DATABASE IF EXISTS PPS_APP;
CREATE DATABASE PPS_APP
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE PPS_APP;

-- 1) 업체 정보 (MD_stores)
CREATE TABLE IF NOT EXISTS MD_stores (
  store_id VARCHAR(50) PRIMARY KEY,  -- 사전승낙서 번호 또는 업체명 기반 임시 ID
  store_name VARCHAR(100) NOT NULL,
  address VARCHAR(255),  -- 도로명 주소
  address_region VARCHAR(50),  -- 시/도
  address_district VARCHAR(50),  -- 시/군/구
  address_detail VARCHAR(255),  -- 건물/층/호수
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  operating_hours VARCHAR(100),
  contact_number VARCHAR(20),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_region (address_region, address_district),
  KEY idx_geo (latitude, longitude)
) ENGINE=InnoDB;

-- 2) 휴대폰 모델 정보 (MD_phone_models)
CREATE TABLE IF NOT EXISTS MD_phone_models (
  model_id INT PRIMARY KEY AUTO_INCREMENT,
  manufacturer VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  storage_gb INT NOT NULL,
  release_price INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_model (manufacturer, model_name, storage_gb),
  KEY idx_mfg_name (manufacturer, model_name)
) ENGINE=InnoDB;

-- 3) 부가서비스 마스터 (MD_extra_services)
CREATE TABLE IF NOT EXISTS MD_extra_services (
  extra_service_id INT PRIMARY KEY AUTO_INCREMENT,
  carrier VARCHAR(10) NOT NULL,
  extra_service_name VARCHAR(100) NOT NULL,
  monthly_price INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_carrier (carrier)
) ENGINE=InnoDB;

-- 4) 공시지원금 기준정보 (MD_official_subsidy)
CREATE TABLE IF NOT EXISTS MD_official_subsidy (
  official_subsidy_id INT PRIMARY KEY AUTO_INCREMENT,
  model_id INT NOT NULL,
  carrier VARCHAR(10) NOT NULL,
  subsidy_amount INT NOT NULL,
  required_plan_min VARCHAR(100),
  notes VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subsidy_model FOREIGN KEY (model_id) REFERENCES MD_phone_models(model_id) ON DELETE CASCADE,
  KEY idx_model_carrier (model_id, carrier)
) ENGINE=InnoDB;

-- 5) Mobile plan 기준정보 (MD_mobile_plans)
CREATE TABLE IF NOT EXISTS MD_mobile_plans (
  plan_id INT PRIMARY KEY AUTO_INCREMENT,
  carrier VARCHAR(10) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  monthly_fee INT NOT NULL,
  data_gb DECIMAL(6,2),  -- 무제한일 땐 NULL
  voice_min INT,  -- 무제한일 땐 NULL
  notes VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_carrier (carrier)
) ENGINE=InnoDB;

-- 6) 가격 정보 (TB_phone_market_prices)
CREATE TABLE IF NOT EXISTS TB_phone_market_prices (
  price_id VARCHAR(150) PRIMARY KEY,  -- YYYYMMDD_모델명_통신사_가입유형_지원금유형 형식
  store_id VARCHAR(50) NOT NULL,
  model_id INT NOT NULL,
  model_description VARCHAR(100),  -- 시세표 원문 표기
  carrier VARCHAR(10) NOT NULL,  -- SK, KT, LG
  subscription_type VARCHAR(10) NOT NULL,  -- 번이/기변
  discount_type VARCHAR(10) NOT NULL,  -- 공시/선약
  subsidy_amount INT NOT NULL DEFAULT 0,  -- 실제 공시지원금
  price INT NOT NULL,  -- 수령액은 음수 허용
  required_plan VARCHAR(100),
  plan_id INT,
  plan_maintenance_period INT,
  has_extra_services_yn CHAR(1) NOT NULL DEFAULT 'N',
  has_card_condition BOOLEAN NOT NULL DEFAULT FALSE,
  card_discount_details VARCHAR(255),
  has_internet_condition BOOLEAN NOT NULL DEFAULT FALSE,
  has_trade_in_condition BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  price_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  source_url VARCHAR(255),
  CONSTRAINT fk_price_store FOREIGN KEY (store_id) REFERENCES MD_stores(store_id) ON DELETE CASCADE,
  CONSTRAINT fk_price_model FOREIGN KEY (model_id) REFERENCES MD_phone_models(model_id) ON DELETE CASCADE,
  CONSTRAINT fk_price_plan FOREIGN KEY (plan_id) REFERENCES MD_mobile_plans(plan_id) ON DELETE SET NULL,
  KEY idx_model_date_price (model_id, price_date, price),
  KEY idx_store (store_id),
  KEY idx_filters (carrier, subscription_type, discount_type)
) ENGINE=InnoDB;

-- 7) 업체-부가서비스 연결 (LINK_store_extra_services)
CREATE TABLE IF NOT EXISTS LINK_store_extra_services (
  store_id VARCHAR(50) NOT NULL,
  carrier VARCHAR(10) NOT NULL,
  extra_service_id INT NOT NULL,
  extra_service_name VARCHAR(100),
  extra_service_maintenance_period INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (store_id, carrier, extra_service_id),
  CONSTRAINT fk_link_store FOREIGN KEY (store_id) REFERENCES MD_stores(store_id) ON DELETE CASCADE,
  CONSTRAINT fk_link_service FOREIGN KEY (extra_service_id) REFERENCES MD_extra_services(extra_service_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8) 사용자 정보 (TB_users)
CREATE TABLE IF NOT EXISTS TB_users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- 소셜 로그인 사용자는 NULL
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  birth_date DATE,
  gender ENUM('M', 'F', 'OTHER'),
  user_type ENUM('BUYER', 'SELLER') NOT NULL DEFAULT 'BUYER',
  profile_image_url VARCHAR(500),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  terms_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_nickname (nickname),
  KEY idx_user_type (user_type)
) ENGINE=InnoDB;

-- 9) 소셜 로그인 연동 정보 (TB_social_accounts)
CREATE TABLE IF NOT EXISTS TB_social_accounts (
  social_account_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  provider ENUM('NAVER', 'KAKAO', 'GOOGLE', 'APPLE') NOT NULL,
  provider_user_id VARCHAR(100) NOT NULL,
  provider_email VARCHAR(255),
  provider_nickname VARCHAR(100),
  provider_profile_image VARCHAR(500),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at DATETIME,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE, -- 주 로그인 수단 여부
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES TB_users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_provider_user (provider, provider_user_id),
  KEY idx_user_provider (user_id, provider)
) ENGINE=InnoDB;

-- 10) 사용자 세션 관리 (TB_user_sessions)
CREATE TABLE IF NOT EXISTS TB_user_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  device_info VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  last_accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES TB_users(user_id) ON DELETE CASCADE,
  KEY idx_user_id (user_id),
  KEY idx_expires (expires_at),
  KEY idx_refresh_token (refresh_token)
) ENGINE=InnoDB;

-- 11) 사용자 리뷰 (TB_reviews)
CREATE TABLE IF NOT EXISTS TB_reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  store_id VARCHAR(50) NOT NULL,
  user_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_store FOREIGN KEY (store_id) REFERENCES MD_stores(store_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES TB_users(user_id) ON DELETE SET NULL,
  KEY idx_store_rating (store_id, rating),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB;

-- 12) 사용자 관심 업체 (TB_user_favorite_stores)
CREATE TABLE IF NOT EXISTS TB_user_favorite_stores (
  user_id INT NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, store_id),
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES TB_users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_store FOREIGN KEY (store_id) REFERENCES MD_stores(store_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13) 사용자 관심 모델 (TB_user_favorite_models)
CREATE TABLE IF NOT EXISTS TB_user_favorite_models (
  user_id INT NOT NULL,
  model_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, model_id),
  CONSTRAINT fk_favorite_model_user FOREIGN KEY (user_id) REFERENCES TB_users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_model FOREIGN KEY (model_id) REFERENCES MD_phone_models(model_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- VIEWS
CREATE OR REPLACE VIEW v_deals AS
SELECT
  tpmp.price_id,
  mds.store_id,
  mds.store_name,
  mds.address,
  mds.address_region,
  mds.address_district,
  mds.latitude,
  mds.longitude,
  mds.operating_hours,
  mds.contact_number,
  mdpm.manufacturer,
  mdpm.model_name,
  mdpm.storage_gb,
  mdpm.release_price,
  tpmp.model_description,
  tpmp.price,
  tpmp.subsidy_amount,
  tpmp.carrier,
  tpmp.subscription_type,
  tpmp.discount_type,
  tpmp.required_plan,
  tpmp.has_extra_services_yn,
  tpmp.plan_maintenance_period,
  tpmp.has_card_condition,
  tpmp.card_discount_details,
  tpmp.has_internet_condition,
  tpmp.has_trade_in_condition,
  tpmp.notes,
  tpmp.source_url,
  tpmp.price_date,
  tpmp.updated_at
FROM TB_phone_market_prices tpmp
JOIN MD_stores mds ON mds.store_id = tpmp.store_id
JOIN MD_phone_models mdpm ON mdpm.model_id = tpmp.model_id;