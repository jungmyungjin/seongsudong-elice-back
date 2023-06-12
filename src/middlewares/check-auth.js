const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.elice_token;

    // 토큰이 없는 경우
    if (!token) {
      throw new Error('NO token!');
    }

    // 토큰 유효한지 검사
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 이메일 검증으로 로그인 여부 체크
    if (!decodedToken) {
      throw new Error('로그인 유저가 아닙니다.');
    }

    // 동적으로 req에 데이터 추가할 수 있다.
    // 따라서, 이 미들웨어를 거친 라우터에서는 req.user를 통해 email, isAdmin에 접근할 수 있다.
    req.user = {
      email: decodedToken.email,
      isAdmin: decodedToken.isAdmin,
    };

    next();
  } catch (err) {
    console.log(err);
    const error = new Error('Authentication failed!');

    return next(error);
  }
};
