import nodemailer from 'nodemailer';

// 이메일 전송 함수 정의
export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    try {
        // 이메일 전송을 위한 transporter 생성
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // 이메일 서비스 제공자 설정
            port: 587,
            auth: {
                user: 'seongsudong.elice', // 이메일 계정
                pass: 'scepqtnhcksahfse' // 이메일 계정 비밀번호
            }
        });

        // 이메일 옵션 설정
        const mailOptions = {
            from: 'seongsudong.elice@gmail.com', // 발신자 이메일 주소
            to: to, // 수신자 이메일 주소
            subject: subject, // 이메일 제목
            text: text // 이메일 본문
        };

        // 이메일 전송
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

