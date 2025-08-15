require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  console.log('🔧 데이터베이스 설정을 시작합니다...');
  
  try {
    // MySQL 서버에 연결 (데이터베이스 없이)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ MySQL 서버 연결 성공!');

    // 스키마 파일 읽기 및 실행
    console.log('📝 스키마 파일을 읽는 중...');
    const schemaSQL = await fs.readFile(path.join(__dirname, 'sql', '001_schema.sql'), 'utf8');
    
    console.log('🏗️  데이터베이스 및 테이블 생성 중...');
    await connection.query(schemaSQL);
    console.log('✅ 스키마 생성 완료!');

    // 시드 데이터 파일 읽기 및 실행
    console.log('📝 시드 데이터 파일을 읽는 중...');
    const seedSQL = await fs.readFile(path.join(__dirname, 'sql', '002_seed.sql'), 'utf8');
    
    console.log('🌱 샘플 데이터 삽입 중...');
    await connection.query(seedSQL);
    console.log('✅ 시드 데이터 삽입 완료!');

    // 데이터베이스로 전환하여 마이그레이션 확인
    await connection.changeUser({ database: process.env.DB_NAME });
    
    // user_type 컬럼이 존재하는지 확인하고 마이그레이션 실행
    console.log('🔄 마이그레이션 확인 중...');
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM TB_users LIKE 'user_type'"
    );

    if (columns.length === 0) {
      console.log('📝 user_type 마이그레이션 실행 중...');
      const migrationSQL = await fs.readFile(path.join(__dirname, 'sql', '003_add_user_type.sql'), 'utf8');
      await connection.query(migrationSQL);
      console.log('✅ user_type 마이그레이션 완료!');
    } else {
      console.log('✅ user_type 컬럼이 이미 존재합니다.');
    }
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log('📊 생성된 테이블:');
    tables.forEach(table => {
      console.log(`   ✓ ${Object.values(table)[0]}`);
    });

    // 각 테이블의 데이터 개수 확인
    console.log('\n📈 테이블별 데이터 개수:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${result[0].count}개`);
      } catch (error) {
        console.log(`   ${tableName}: 확인 불가 (${error.message})`);
      }
    }

    await connection.end();
    console.log('\n🎉 데이터베이스 설정이 완료되었습니다!');
    console.log('💡 이제 "npm run dev"로 서버를 시작할 수 있습니다.');

  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 MySQL 사용자 이름 또는 비밀번호를 확인해주세요.');
      console.log('💡 XAMPP를 사용하는 경우, 기본적으로 root 사용자에 비밀번호가 없습니다.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 MySQL 서버가 실행 중인지 확인해주세요.');
      console.log('💡 XAMPP Control Panel에서 MySQL을 시작해주세요.');
    }
    
    process.exit(1);
  }
}

setupDatabase();
