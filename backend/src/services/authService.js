/*
DB???묎렐?섏뿬 ?ъ슜?먮? ?앹꽦?섍퀬 鍮꾨?踰덊샇瑜??뺤씤?⑸땲??
*/

const prisma = require('../config/prisma');
// ?곕━媛 ?뺥븳 DB ?ㅺ퀎??Schema)瑜?諛뷀깢?쇰줈 ?ㅼ젣 ?곗씠?곕쿋?댁뒪? ??뷀븯???꾧뎄?낅땲??
const bcrypt = require('bcrypt');
// 鍮꾨?踰덊샇瑜?洹몃?濡???ν븯吏 ?딄퀬, ?꾨Т???뚯븘蹂????녿뒗 ?뷀샇濡?諛붽퓭二쇰뒗 蹂댁븞 ?꾧뎄?낅땲??
const jwt = require('jsonwebtoken');
// ?ъ슜?먭? 濡쒓렇?명뻽?ㅻ뒗 利앺몴??'?붿????좊텇利???諛쒓툒?댁＜???꾧뎄?낅땲??
const notificationService = require('./notificationService');

exports.register = async (email, password, userName, height, weight, gender, styleTags) => {
  // 1. ?대? 媛?낅맂 ?대찓?쇱씤吏 ?뺤씤
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('이미 존재하는 이메일입니다.');
    error.status = 400;
    throw error;
  }

  // 2. 鍮꾨?踰덊샇 ?뷀샇??(蹂댁븞 ?꾩닔)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. ?ъ슜???앹꽦 (?ㅽ궎留덉쓽 ?꾩닔媛믩뱾??梨꾩썙以띾땲??
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      userName: userName,
      height: parseFloat(height), // 臾몄옄?대줈 ?????덉쑝誘濡??レ옄濡?蹂??
      weight: parseFloat(weight),

      // ?ㅽ궎留덉뿉 @default媛 ?덈떎硫??꾨옒???앸왂 媛?ν븯吏留? 
      // 珥덇린 媛???대깽?몃? ?섍퀬 ?띕떎硫?紐낆떆?곸쑝濡??곸뼱以????덉뒿?덈떎.
      coins: 100000,   // 媛??異뺥븯湲?100000肄붿씤 吏湲?
      tokens: 10,     // 臾대즺 ?붿옄???쒕룄沅?10??吏湲?

      // 由ъ뒪??Array) ??낆? 鍮?諛곗뿴濡?珥덇린?뷀빐二쇰뒗 寃껋씠 ?덉쟾?⑸땲??
      styleTags: styleTags || [],
      is_creator: true,
    }
  });
  await notificationService.createNotification({
    userId: user.user_id,
    title: '媛??異뺥븯',
    message: '媛?낆쓣 ?섏쁺?⑸땲?? 異뺥븯 肄붿씤??吏湲됰릺?덉뒿?덈떎.',
    type: 'GENERAL',
    url: '/portfolio',
    data: { coins: user.coins },
  });

  return user;
};
// ?ㅽ궎留덉뿉??????ㅼ뿉 ?媛 ?녾퀬 @default ?ㅼ젙???녿뒗 ?꾨뱶?ㅼ? 諛섎뱶???낅젰
// email: ?좎? ?앸퀎???꾪븳 ?꾩닔 ?뺣낫?낅땲??
// 스키마에 저장할 데이터에 @default 설정이 없는 필드들은 반드시 입력
// email: 유저 식별을 위한 필수 정보입니다.
// userName: 앱 내에서 부를 이름입니다.
// height, weight: 스키마에 Float로 정의되어 있고 @default 설정이 없으므로 가입 시 꼭 받아야 합니다.

exports.login = async (email, password) => {
  // 1. 사용자 존재 확인
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');

  // 2. 비밀번호 일치 확인
  const isMatch = await bcrypt.compare(password, user.password);
  if (!user.is_creator) {
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { is_creator: true },
    });
    user.is_creator = true;
  }
  if (!isMatch) throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');

  // 3. JWT 토큰 생성 (사용자 식별)
  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7일간 유효
  );

  return { user, token };
};


