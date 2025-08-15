const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

class AuthService {
  // 회원가입
  async register(userData) {
    const { email, password, nickname, phoneNumber, birthDate, gender, userType, agreeTerms, agreePrivacy, agreeMarketing } = userData;
    
    try {
      // 이메일 중복 확인
      const [existingUsers] = await db.execute(
        'SELECT user_id FROM TB_users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        return errorResponse('이미 존재하는 이메일입니다.', 409);
      }
      
      // 닉네임 중복 확인
      const [existingNicknames] = await db.execute(
        'SELECT user_id FROM TB_users WHERE nickname = ?',
        [nickname]
      );
      
      if (existingNicknames.length > 0) {
        return errorResponse('이미 존재하는 닉네임입니다.', 409);
      }
      
      // 비밀번호 해싱
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // 사용자 생성
      const [result] = await db.execute(
        `INSERT INTO TB_users 
         (email, password_hash, nickname, phone_number, birth_date, gender, user_type,
          terms_agreed, privacy_agreed, marketing_agreed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, passwordHash, nickname, phoneNumber, birthDate, gender, userType || 'BUYER',
         agreeTerms, agreePrivacy, agreeMarketing]
      );
      
      const userId = result.insertId;
      
      // 토큰 생성
      const tokens = await this.generateTokens(userId);
      
      // 세션 저장
      await this.saveSession(userId, tokens.refreshToken);
      
      // 사용자 정보 조회 (비밀번호 제외)
      const [user] = await this.getUserById(userId);
      
      return successResponse('회원가입이 완료되었습니다.', {
        user,
        tokens
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse('회원가입 중 오류가 발생했습니다.', 500);
    }
  }
  
  // 로그인
  async login(email, password, deviceInfo = null) {
    try {
      // 사용자 조회
      const [users] = await db.execute(
        `SELECT user_id, email, password_hash, nickname, user_type, status, email_verified 
         FROM TB_users WHERE email = ?`,
        [email]
      );
      
      if (users.length === 0) {
        return errorResponse('이메일 또는 비밀번호가 잘못되었습니다.', 401);
      }
      
      const user = users[0];
      
      // 계정 상태 확인
      if (user.status !== 'ACTIVE') {
        return errorResponse('비활성화된 계정입니다.', 403);
      }
      
      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse('이메일 또는 비밀번호가 잘못되었습니다.', 401);
      }
      
      // 토큰 생성
      const tokens = await this.generateTokens(user.user_id);
      
      // 세션 저장
      await this.saveSession(user.user_id, tokens.refreshToken, deviceInfo);
      
      // 마지막 로그인 시간 업데이트
      await db.execute(
        'UPDATE TB_users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [user.user_id]
      );
      
      // 사용자 정보 조회 (비밀번호 제외)
      const [userInfo] = await this.getUserById(user.user_id);
      
      return successResponse('로그인이 완료되었습니다.', {
        user: userInfo,
        tokens
      });
      
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse('로그인 중 오류가 발생했습니다.', 500);
    }
  }
  
  // 소셜 로그인
  async socialLogin(provider, providerData, deviceInfo = null) {
    const { providerId, email, nickname, profileImage } = providerData;
    
    try {
      // 기존 소셜 계정 확인
      const [socialAccounts] = await db.execute(
        'SELECT user_id FROM TB_social_accounts WHERE provider = ? AND provider_user_id = ?',
        [provider, providerId]
      );
      
      let userId;
      
      if (socialAccounts.length > 0) {
        // 기존 사용자 로그인
        userId = socialAccounts[0].user_id;
        
        // 소셜 계정 정보 업데이트
        await db.execute(
          `UPDATE TB_social_accounts 
           SET provider_email = ?, provider_nickname = ?, provider_profile_image = ?, 
               access_token = ?, token_expires_at = ?, updated_at = CURRENT_TIMESTAMP
           WHERE provider = ? AND provider_user_id = ?`,
          [email, nickname, profileImage, providerData.accessToken, 
           providerData.expiresAt, provider, providerId]
        );
        
      } else {
        // 새 사용자 생성
        // 이메일로 기존 사용자 확인
        const [existingUsers] = await db.execute(
          'SELECT user_id FROM TB_users WHERE email = ?',
          [email]
        );
        
        if (existingUsers.length > 0) {
          userId = existingUsers[0].user_id;
        } else {
          // 닉네임 중복 확인 및 고유 닉네임 생성
          let uniqueNickname = nickname;
          let counter = 1;
          
          while (true) {
            const [nicknameCheck] = await db.execute(
              'SELECT user_id FROM TB_users WHERE nickname = ?',
              [uniqueNickname]
            );
            
            if (nicknameCheck.length === 0) break;
            
            uniqueNickname = `${nickname}${counter}`;
            counter++;
          }
          
          // 새 사용자 생성
          const [result] = await db.execute(
            `INSERT INTO TB_users 
             (email, nickname, profile_image_url, user_type, email_verified, terms_agreed, privacy_agreed) 
             VALUES (?, ?, ?, 'BUYER', TRUE, TRUE, TRUE)`,
            [email, uniqueNickname, profileImage]
          );
          
          userId = result.insertId;
        }
        
        // 소셜 계정 연동
        await db.execute(
          `INSERT INTO TB_social_accounts 
           (user_id, provider, provider_user_id, provider_email, provider_nickname, 
            provider_profile_image, access_token, token_expires_at, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [userId, provider, providerId, email, nickname, profileImage, 
           providerData.accessToken, providerData.expiresAt]
        );
      }
      
      // 토큰 생성
      const tokens = await this.generateTokens(userId);
      
      // 세션 저장
      await this.saveSession(userId, tokens.refreshToken, deviceInfo);
      
      // 마지막 로그인 시간 업데이트
      await db.execute(
        'UPDATE TB_users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [userId]
      );
      
      // 사용자 정보 조회
      const [user] = await this.getUserById(userId);
      
      return successResponse('소셜 로그인이 완료되었습니다.', {
        user,
        tokens
      });
      
    } catch (error) {
      console.error('Social login error:', error);
      return errorResponse('소셜 로그인 중 오류가 발생했습니다.', 500);
    }
  }
  
  // 토큰 갱신
  async refreshToken(refreshToken) {
    try {
      // 세션 확인
      const [sessions] = await db.execute(
        'SELECT user_id, expires_at FROM TB_user_sessions WHERE refresh_token = ?',
        [refreshToken]
      );
      
      if (sessions.length === 0) {
        return errorResponse('유효하지 않은 토큰입니다.', 401);
      }
      
      const session = sessions[0];
      
      // 토큰 만료 확인
      if (new Date() > new Date(session.expires_at)) {
        // 만료된 세션 삭제
        await db.execute(
          'DELETE FROM TB_user_sessions WHERE refresh_token = ?',
          [refreshToken]
        );
        return errorResponse('만료된 토큰입니다.', 401);
      }
      
      // 새 토큰 생성
      const tokens = await this.generateTokens(session.user_id);
      
      // 세션 업데이트
      await db.execute(
        `UPDATE TB_user_sessions 
         SET refresh_token = ?, expires_at = ?, last_accessed_at = CURRENT_TIMESTAMP
         WHERE refresh_token = ?`,
        [tokens.refreshToken, tokens.refreshExpiresAt, refreshToken]
      );
      
      return successResponse('토큰이 갱신되었습니다.', { tokens });
      
    } catch (error) {
      console.error('Token refresh error:', error);
      return errorResponse('토큰 갱신 중 오류가 발생했습니다.', 500);
    }
  }
  
  // 로그아웃
  async logout(refreshToken) {
    try {
      await db.execute(
        'DELETE FROM TB_user_sessions WHERE refresh_token = ?',
        [refreshToken]
      );
      
      return successResponse('로그아웃되었습니다.');
      
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse('로그아웃 중 오류가 발생했습니다.', 500);
    }
  }
  
  // 모든 기기에서 로그아웃
  async logoutAll(userId) {
    try {
      await db.execute(
        'DELETE FROM TB_user_sessions WHERE user_id = ?',
        [userId]
      );
      
      return successResponse('모든 기기에서 로그아웃되었습니다.');
      
    } catch (error) {
      console.error('Logout all error:', error);
      return errorResponse('로그아웃 중 오류가 발생했습니다.', 500);
    }
  }
  
  // JWT 토큰 생성
  async generateTokens(userId) {
    const payload = { userId };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    const refreshToken = uuidv4();
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7일 후 만료
    
    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      refreshExpiresAt
    };
  }
  
  // 세션 저장
  async saveSession(userId, refreshToken, deviceInfo = null, userAgent = null, ipAddress = null) {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await db.execute(
      `INSERT INTO TB_user_sessions 
       (session_id, user_id, refresh_token, device_info, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, userId, refreshToken, deviceInfo, userAgent, ipAddress, expiresAt]
    );
  }
  
  // 사용자 정보 조회 (비밀번호 제외)
  async getUserById(userId) {
    const [users] = await db.execute(
      `SELECT user_id, email, nickname, phone_number, birth_date, gender, user_type,
              profile_image_url, email_verified, phone_verified, status,
              terms_agreed, privacy_agreed, marketing_agreed, last_login_at,
              created_at, updated_at
       FROM TB_users WHERE user_id = ? AND status = 'ACTIVE'`,
      [userId]
    );
    
    return users;
  }

  // 사용자 정보 업데이트
  async updateUser(userId, updateData) {
    const { nickname, phoneNumber, birthDate, gender, userType, marketingAgreed } = updateData;
    
    try {
      // 닉네임이 변경되는 경우 중복 확인
      if (nickname) {
        const [existingUsers] = await db.execute(
          'SELECT user_id FROM TB_users WHERE nickname = ? AND user_id != ?',
          [nickname, userId]
        );
        
        if (existingUsers.length > 0) {
          return errorResponse('이미 존재하는 닉네임입니다.', 409);
        }
      }
      
      // 업데이트할 필드들 동적 생성
      const updateFields = [];
      const updateValues = [];
      
      if (nickname !== undefined) {
        updateFields.push('nickname = ?');
        updateValues.push(nickname);
      }
      if (phoneNumber !== undefined) {
        updateFields.push('phone_number = ?');
        updateValues.push(phoneNumber);
      }
      if (birthDate !== undefined) {
        updateFields.push('birth_date = ?');
        updateValues.push(birthDate);
      }
      if (gender !== undefined) {
        updateFields.push('gender = ?');
        updateValues.push(gender);
      }
      if (userType !== undefined) {
        updateFields.push('user_type = ?');
        updateValues.push(userType);
      }
      if (marketingAgreed !== undefined) {
        updateFields.push('marketing_agreed = ?');
        updateValues.push(marketingAgreed);
      }
      
      if (updateFields.length === 0) {
        return errorResponse('업데이트할 정보가 없습니다.', 400);
      }
      
      // updated_at 필드 추가
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);
      
      // 사용자 정보 업데이트
      await db.execute(
        `UPDATE TB_users SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );
      
      // 업데이트된 사용자 정보 조회
      const [updatedUser] = await this.getUserById(userId);
      
      return successResponse('사용자 정보가 업데이트되었습니다.', updatedUser);
      
    } catch (error) {
      console.error('Update user error:', error);
      return errorResponse('사용자 정보 업데이트 중 오류가 발생했습니다.', 500);
    }
  }
  
  // JWT 토큰 검증
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  // 사용자 세션 정리 (만료된 세션 삭제)
  async cleanupExpiredSessions() {
    try {
      await db.execute(
        'DELETE FROM TB_user_sessions WHERE expires_at < CURRENT_TIMESTAMP'
      );
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}

module.exports = new AuthService();
