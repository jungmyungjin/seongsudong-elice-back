import React from 'react';
import axios from 'axios';

interface LoginPageProps {
  handleLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
  const handleGoogleLogin = async () => {
    try {
      // 구글 로그인 처리를 위한 API 엔드포인트 URL
      const apiUrl = 'http://localhost:3000/api/google/login';

      // 구글 로그인 요청을 보냅니다.
      const response = await axios.get(apiUrl);

      // 로그인 성공 시 백엔드로부터 받은 토큰이나 세션 등을 저장하여 인증 상태를 유지합니다.
      // 예시에서는 로그인 성공 시 handleLogin 함수를 호출하여 인증 상태를 변경하도록 하겠습니다.
      handleLogin();
    } catch (error) {
      // 로그인 실패 시 에러 처리를 수행합니다.
      console.log('로그인 실패:', error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default LoginPage;
