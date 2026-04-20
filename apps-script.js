/**
 * 튜달보살 운세 랜딩페이지 — 데이터 수집 백엔드
 * Google Apps Script (Code.gs)
 *
 * ══ 배포 방법 ══════════════════════════════════════════════
 * 1. Google Sheets 새 파일 생성
 * 2. [확장 프로그램] → [Apps Script] 메뉴 클릭
 * 3. 아래 코드 전체 붙여넣기 (기존 코드 삭제 후)
 * 4. 저장 (Ctrl+S)
 * 5. [배포] → [새 배포] 클릭
 *    - 유형: 웹 앱
 *    - 다음 사용자로 실행: 나 (본인 계정)
 *    - 액세스 권한: 모든 사용자
 * 6. [배포] 클릭 → URL 복사
 * 7. index.html 상단의 APPS_SCRIPT_URL에 복사한 URL 붙여넣기
 * ═══════════════════════════════════════════════════════════
 */

// 시트 헤더 정의 (순서 중요)
const HEADERS = [
  '타임스탬프',
  '성함',
  '회사명',
  '소속 부서',
  '직급/직책',
  '회사 이메일',
  '연락처',
  '마케팅 수신 동의',
  '배정 운세 번호',
  '운세명',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content'
];

// 운세 이름 매핑 (번호 → 이름)
const FORTUNE_NAMES = {
  1: '木曜昇天 (목요승천)',
  2: '金星入室 (금성입실)',
  3: '貴人相助 (귀인상조)',
  4: '百花齊放 (백화제방)',
  5: '轉禍爲福 (전화위복)',
  6: '厚積薄發 (후적박발)',
  7: '龍騰四海 (용등사해)',
  8: '花開富貴 (화개부귀)',
  9: '吉星高照 (길성고조)',
  10: '風生水起 (풍생수기)',
  11: '萬事如意 (만사여의)',
  12: '鳳凰來儀 (봉황래의)',
  13: '雨後晴天 (우후청천)',
  14: '紫氣東來 (자기동래)',
  15: '旭日昇天 (욱일승천)',
  16: '明珠出水 (명주출수)',
  17: '春風得意 (춘풍득의)',
  18: '水到渠成 (수도거성)',
  19: '馬到成功 (마도성공)',
  20: '一帆風順 (일범풍순)',
  21: '步步高升 (보보고승)',
  22: '心想事成 (심상사성)',
  23: '好事多磨 (호사다마)',
  24: '欲速不達 (욕속부달)',
  25: '有備無患 (유비무환)',
  26: '日就月將 (일취월장)',
  27: '破竹之勢 (파죽지세)',
  28: '積小成大 (적소성대)',
  29: '絶處逢生 (절처봉생)',
  30: '後來居上 (후래거상)',
  31: '事半功倍 (사반공배)',
  32: '一鳴驚人 (일명경인)',
  33: '柳暗花明 (유암화명)',
  34: '天道酬勤 (천도수근)',
  35: '臥薪嘗膽 (와신상담)',
  36: '見機而作 (견기이작)',
  37: '精誠所至 (정성소지)',
  38: '靑出於藍 (청출어람)',
  39: '以柔制剛 (이유제강)',
  40: '衆志成城 (중지성성)',
  41: '龍蛇飛動 (용사비동)',
  42: '謙受益 (겸수익)',
  43: '守正出奇 (수정출기)',
  44: '因勢利導 (인세이도)',
  45: '三思而後行 (삼사이후행)',
  46: '博學篤志 (박학독지)',
  47: '千里之行 (천리지행)',
  48: '金石爲開 (금석위개)',
  49: '相輔相成 (상보상성)',
  50: '蓄積待發 (축적대발)'
};

/**
 * POST 요청 처리 — 폼 데이터를 시트에 저장
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];

    // 헤더 행 없으면 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground('#3A6E68');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // 데이터 행 추가
    sheet.appendRow([
      new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      data.name           || '',
      data.company        || '',
      data.department     || '',
      data.position       || '',
      data.email          || '',
      data.phone          || '',
      data.marketingConsent ? 'Y' : 'N',
      data.fortuneId      || '',
      FORTUNE_NAMES[data.fortuneId] || '',
      data.utm_source     || '',
      data.utm_medium     || '',
      data.utm_campaign   || '',
      data.utm_content    || ''
    ]);

    // 열 너비 자동 조정 (최초 100행 이후 성능 고려해 조건부 실행)
    if (sheet.getLastRow() <= 5) {
      sheet.autoResizeColumns(1, HEADERS.length);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 처리 — 간단한 헬스체크 (배포 후 URL 접근 테스트용)
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: '튜달보살 운세 수집기' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * [선택] 수동 실행용 — 누적 데이터 CSV 다운로드 링크 생성
 * Apps Script 편집기에서 직접 실행하면 로그에 URL 출력됨
 */
function exportToDriveCSV() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data  = sheet.getDataRange().getValues();

  const csv = data.map(row =>
    row.map(cell => {
      const s = String(cell).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    }).join(',')
  ).join('\n');

  const blob = Utilities.newBlob('\uFEFF' + csv, 'text/csv', '튜달보살_운세_수집_' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd') + '.csv');
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  Logger.log('CSV 다운로드 링크: ' + file.getDownloadUrl());
  return file.getDownloadUrl();
}
