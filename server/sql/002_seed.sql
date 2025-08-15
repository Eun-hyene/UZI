USE PPS_APP;

-- 1) 업체 정보 (MD_stores) 샘플 데이터
INSERT INTO MD_stores (store_id, store_name, address, address_region, address_district, address_detail, is_verified, operating_hours, contact_number, latitude, longitude)
VALUES
('STORE001', '강남폰마트', '서울특별시 강남구 테헤란로 123', '서울특별시', '강남구', '삼성빌딩 1층', TRUE, '평일 10:00-20:00', '02-1234-5678', 37.5665, 126.9780),
('STORE002', '홍대휴대폰샵', '서울특별시 마포구 홍익로 45', '서울특별시', '마포구', '홍대상가 2층 201호', TRUE, '매일 11:00-22:00', '02-2345-6789', 37.5512, 126.9226),
('STORE003', '부산중앙대리점', '부산광역시 중구 중앙대로 89', '부산광역시', '중구', '부산타워빌딩 3층', TRUE, '평일 09:30-19:30', '051-3456-7890', 35.1796, 129.0756),
('ONLINE001', '텔레콤몰', NULL, '온라인', '온라인', NULL, TRUE, '24시간', '1588-1234', NULL, NULL),
('OFFICIAL_SK', 'SK텔레콤 공식몰', NULL, '온라인', '온라인', NULL, TRUE, '24시간', '114', NULL, NULL);

-- 2) 휴대폰 모델 정보 (MD_phone_models) 샘플 데이터
INSERT INTO MD_phone_models (manufacturer, model_name, storage_gb, release_price)
VALUES
('Samsung', 'Galaxy S25', 128, 1150000),
('Samsung', 'Galaxy S25', 256, 1250000),
('Samsung', 'Galaxy S25', 512, 1450000),
('Samsung', 'Galaxy S25 Plus', 256, 1350000),
('Samsung', 'Galaxy S25 Plus', 512, 1550000),
('Samsung', 'Galaxy S25 Ultra', 256, 1650000),
('Samsung', 'Galaxy S25 Ultra', 512, 1850000),
('Samsung', 'Galaxy S25 Ultra', 1024, 2150000),
('Apple', 'iPhone 15', 128, 1250000),
('Apple', 'iPhone 15', 256, 1400000),
('Apple', 'iPhone 15 Pro', 128, 1550000),
('Apple', 'iPhone 15 Pro', 256, 1700000),
('Apple', 'iPhone 15 Pro Max', 256, 1850000),
('Apple', 'iPhone 15 Pro Max', 512, 2100000);

-- 3) 부가서비스 마스터 (MD_extra_services) 샘플 데이터
INSERT INTO MD_extra_services (carrier, extra_service_name, monthly_price)
VALUES
('SK', 'T map', 3000),
('SK', '멜론', 8000),
('SK', 'TVING', 9900),
('SK', '네이버플러스 멤버십', 4900),
('KT', '지니뮤직', 7000),
('KT', '시즌', 13000),
('KT', 'KT알파', 5000),
('LG', '유플러스tv', 15000),
('LG', 'FLO', 7000),
('LG', 'U+골프', 9900);

-- 4) Mobile plan 기준정보 (MD_mobile_plans) 샘플 데이터
INSERT INTO MD_mobile_plans (carrier, plan_name, monthly_fee, data_gb, voice_min, notes)
VALUES
('SK', '5GX 프라임', 55000, NULL, NULL, '데이터/음성 무제한'),
('SK', '5GX 프라임플러스', 75000, NULL, NULL, '데이터/음성 무제한 + 로밍'),
('SK', '5GX 베이직', 35000, 8, 300, '기본형'),
('KT', '5G 프리미어', 55000, NULL, NULL, '데이터/음성 무제한'),
('KT', '5G 프리미어 플러스', 75000, NULL, NULL, '데이터/음성 무제한 + 부가'),
('KT', '5G 베이직', 35000, 8, 300, '기본형'),
('LG', '5G 프리미엄', 55000, NULL, NULL, '데이터/음성 무제한'),
('LG', '5G 프리미엄 플러스', 75000, NULL, NULL, '데이터/음성 무제한 + 혜택'),
('LG', '5G 베이직', 35000, 8, 300, '기본형');

-- 5) 공시지원금 기준정보 (MD_official_subsidy) 샘플 데이터
INSERT INTO MD_official_subsidy (model_id, carrier, subsidy_amount, required_plan_min, notes)
VALUES
-- Galaxy S25 128GB (model_id = 1)
(1, 'SK', 150000, '5GX 베이직 이상', '출시 기념'),
(1, 'KT', 140000, '5G 베이직 이상', NULL),
(1, 'LG', 145000, '5G 베이직 이상', NULL),
-- Galaxy S25 256GB (model_id = 2)
(2, 'SK', 200000, '5GX 프라임 이상', NULL),
(2, 'KT', 190000, '5G 프리미어 이상', NULL),
(2, 'LG', 195000, '5G 프리미엄 이상', NULL),
-- iPhone 15 128GB (model_id = 9)
(9, 'SK', 100000, '5GX 프라임 이상', '애플 제한'),
(9, 'KT', 95000, '5G 프리미어 이상', '애플 제한'),
(9, 'LG', 98000, '5G 프리미엄 이상', '애플 제한');

-- 6) 가격 정보 (TB_phone_market_prices) 샘플 데이터
INSERT INTO TB_phone_market_prices 
(price_id, store_id, model_id, model_description, carrier, subscription_type, discount_type, subsidy_amount, price, required_plan, plan_id, plan_maintenance_period, has_extra_services_yn, has_card_condition, card_discount_details, has_internet_condition, has_trade_in_condition, notes, price_date, source_url)
VALUES
-- Galaxy S25 128GB 가격들
('20250115_GalaxyS25_128_SK_번이_공시', 'STORE001', 1, 'S25 128GB', 'SK', '번이', '공시', 150000, 1000000, '5GX 프라임', 2, 6, 'Y', FALSE, NULL, FALSE, FALSE, '현금완납', '2025-01-15', NULL),
('20250115_GalaxyS25_128_SK_기변_선약', 'STORE001', 1, 'S25 128GB', 'SK', '기변', '선약', 200000, 950000, '5GX 프라임플러스', 2, 12, 'Y', TRUE, '월 50만원 이상 사용', FALSE, FALSE, '제휴카드 필수', '2025-01-15', NULL),
('20250115_GalaxyS25_128_KT_번이_공시', 'STORE002', 1, 'S25 128GB', 'KT', '번이', '공시', 140000, 1010000, '5G 프리미어', 5, 6, 'N', FALSE, NULL, FALSE, FALSE, '당일출고', '2025-01-15', NULL),
('20250115_GalaxyS25_128_LG_기변_공시', 'STORE003', 1, 'S25 128GB', 'LG', '기변', '공시', 145000, 1005000, '5G 프리미엄', 7, 6, 'Y', FALSE, NULL, TRUE, FALSE, '인터넷 결합 시', '2025-01-15', NULL),
('20250115_GalaxyS25_128_SK_번이_공시_온라인', 'ONLINE001', 1, 'S25 128GB', 'SK', '번이', '공시', 150000, 980000, '5GX 프라임', 1, 6, 'N', FALSE, NULL, FALSE, FALSE, '온라인 특가', '2025-01-15', 'https://telecom-mall.com/galaxy-s25'),

-- Galaxy S25 256GB 가격들
('20250115_GalaxyS25_256_SK_번이_공시', 'STORE001', 2, 'S25 256GB', 'SK', '번이', '공시', 200000, 1050000, '5GX 프라임', 1, 6, 'Y', FALSE, NULL, FALSE, FALSE, NULL, '2025-01-15', NULL),
('20250115_GalaxyS25_256_KT_기변_선약', 'STORE002', 2, 'S25 256GB', 'KT', '기변', '선약', 250000, 1000000, '5G 프리미어 플러스', 5, 12, 'Y', TRUE, '현대카드 월 30만원', FALSE, TRUE, '기기반납 조건', '2025-01-15', NULL),

-- iPhone 15 128GB 가격들
('20250115_iPhone15_128_SK_번이_공시', 'STORE001', 9, 'iPhone 15 128GB', 'SK', '번이', '공시', 100000, 1150000, '5GX 프라임', 1, 6, 'N', FALSE, NULL, FALSE, FALSE, '애플 정품', '2025-01-15', NULL),
('20250115_iPhone15_128_KT_기변_공시', 'STORE002', 9, 'iPhone 15 128GB', 'KT', '기변', '공시', 95000, 1155000, '5G 프리미어', 4, 6, 'N', FALSE, NULL, FALSE, FALSE, NULL, '2025-01-15', NULL),
('20250115_iPhone15_128_SK_번이_공시_공식', 'OFFICIAL_SK', 9, 'iPhone 15 128GB', 'SK', '번이', '공시', 100000, 1150000, '5GX 프라임', 1, 6, 'N', FALSE, NULL, FALSE, FALSE, 'SK 공식 판매', '2025-01-15', 'https://shop.tworld.co.kr');

-- 7) 업체-부가서비스 연결 (LINK_store_extra_services) 샘플 데이터
INSERT INTO LINK_store_extra_services (store_id, carrier, extra_service_id, extra_service_name, extra_service_maintenance_period)
VALUES
-- STORE001의 SK 부가서비스
('STORE001', 'SK', 1, 'T map', 6),
('STORE001', 'SK', 2, '멜론', 12),
-- STORE001의 KT 부가서비스  
('STORE001', 'KT', 5, '지니뮤직', 6),
-- STORE002의 KT 부가서비스
('STORE002', 'KT', 6, '시즌', 12),
('STORE002', 'KT', 7, 'KT알파', 6),
-- STORE003의 LG 부가서비스
('STORE003', 'LG', 8, '유플러스tv', 12),
('STORE003', 'LG', 9, 'FLO', 6);

-- 8) 사용자 정보 (TB_users) 샘플 데이터
INSERT INTO TB_users (user_id, email, password_hash, nickname, phone_number, birth_date, gender, user_type, email_verified, phone_verified, terms_agreed, privacy_agreed, marketing_agreed, last_login_at)
VALUES
(1001, 'user1@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '폰마니아', '010-1234-5678', '1990-05-15', 'M', 'BUYER', TRUE, TRUE, TRUE, TRUE, FALSE, '2025-01-15 10:30:00'),
(1002, 'user2@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '갤럭시팬', '010-2345-6789', '1985-12-03', 'F', 'BUYER', TRUE, FALSE, TRUE, TRUE, TRUE, '2025-01-14 15:20:00'),
(1003, 'user3@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '아이폰유저', '010-3456-7890', '1995-08-22', 'M', 'SELLER', TRUE, TRUE, TRUE, TRUE, FALSE, '2025-01-13 09:45:00'),
(1004, 'naver_user@naver.com', NULL, '네이버맨', '010-4567-8901', '1988-11-10', 'M', 'BUYER', TRUE, FALSE, TRUE, TRUE, TRUE, '2025-01-15 14:15:00'),
(1005, 'kakao_user@kakao.com', NULL, '카카오톡', '010-5678-9012', '1992-02-28', 'F', 'BUYER', TRUE, TRUE, TRUE, TRUE, FALSE, '2025-01-12 11:30:00'),
(1006, 'user6@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '부산댁', '010-6789-0123', '1980-07-18', 'F', 'SELLER', TRUE, TRUE, TRUE, TRUE, TRUE, '2025-01-11 16:45:00'),
(1007, 'user7@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '테크러버', '010-7890-1234', '1993-04-05', 'OTHER', 'BUYER', TRUE, FALSE, TRUE, TRUE, FALSE, '2025-01-10 13:20:00'),
(1008, 'user8@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '온라인샵퍼', '010-8901-2345', '1987-09-14', 'M', 'BUYER', TRUE, TRUE, TRUE, TRUE, TRUE, '2025-01-15 08:10:00'),
(1009, 'user9@example.com', '$2b$12$OKJt7AFO4dEsnbB.smh6uOe7uBg80zPhxnY2e5zQC2lZg12CxLQ6a', '모바일마스터', '010-9012-3456', '1991-06-30', 'F', 'SELLER', TRUE, TRUE, TRUE, TRUE, FALSE, '2025-01-14 19:25:00');

-- 9) 소셜 로그인 연동 정보 (TB_social_accounts) 샘플 데이터
INSERT INTO TB_social_accounts (user_id, provider, provider_user_id, provider_email, provider_nickname, provider_profile_image, is_primary, access_token, refresh_token, token_expires_at)
VALUES
(1004, 'NAVER', 'naver_123456789', 'naver_user@naver.com', '네이버맨', 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', TRUE, 'naver_access_token_sample', 'naver_refresh_token_sample', '2025-02-15 14:15:00'),
(1005, 'KAKAO', 'kakao_987654321', 'kakao_user@kakao.com', '카카오톡', 'https://k.kakaocdn.net/dn/profile_image.jpg', TRUE, 'kakao_access_token_sample', 'kakao_refresh_token_sample', '2025-02-12 11:30:00');

-- 10) 사용자 관심 업체 (TB_user_favorite_stores) 샘플 데이터
INSERT INTO TB_user_favorite_stores (user_id, store_id)
VALUES
(1001, 'STORE001'),
(1001, 'ONLINE001'),
(1002, 'STORE002'),
(1003, 'STORE001'),
(1003, 'OFFICIAL_SK'),
(1004, 'STORE002'),
(1005, 'STORE003'),
(1006, 'STORE003'),
(1007, 'ONLINE001'),
(1008, 'ONLINE001'),
(1009, 'STORE001');

-- 11) 사용자 관심 모델 (TB_user_favorite_models) 샘플 데이터
INSERT INTO TB_user_favorite_models (user_id, model_id)
VALUES
(1001, 1), -- Galaxy S25 128GB
(1001, 2), -- Galaxy S25 256GB
(1002, 1), -- Galaxy S25 128GB
(1002, 3), -- Galaxy S25 512GB
(1003, 9), -- iPhone 15 128GB
(1003, 10), -- iPhone 15 256GB
(1004, 1), -- Galaxy S25 128GB
(1005, 6), -- Galaxy S25 Ultra 256GB
(1006, 1), -- Galaxy S25 128GB
(1007, 2), -- Galaxy S25 256GB
(1008, 9), -- iPhone 15 128GB
(1009, 1); -- Galaxy S25 128GB

-- 12) 사용자 리뷰 (TB_reviews) 샘플 데이터
INSERT INTO TB_reviews (store_id, user_id, rating, comment, is_anonymous)
VALUES
('STORE001', 1001, 5, '친절하고 가격도 합리적이에요. 추천합니다!', FALSE),
('STORE001', 1002, 4, '빠른 처리와 정확한 상담 감사해요.', FALSE),
('STORE001', 1003, 5, '다른 곳보다 훨씬 저렴하게 구매했습니다.', FALSE),
('STORE002', 1004, 4, '홍대 근처라 접근성이 좋고 직원분들이 친절해요.', FALSE),
('STORE002', 1005, 3, '가격은 괜찮은데 대기시간이 좀 길어요.', TRUE),
('STORE003', 1006, 5, '부산에서 가장 믿을만한 휴대폰샵! 계속 이용할게요.', FALSE),
('STORE003', 1007, 4, '정직한 상담과 합리적인 가격이 마음에 듭니다.', FALSE),
('ONLINE001', 1008, 4, '온라인 주문 후 빠른 배송 만족스럽습니다.', FALSE),
('ONLINE001', 1009, 5, '매장 방문 없이도 좋은 가격에 구매할 수 있어서 좋아요.', TRUE);