/**
 * SINGLE SOURCE OF TRUTH for all articles.
 * Managed automatically by: scripts/publish.js
 *
 * Each entry:
 *   date  – YYYY-MM-DD
 *   slug  – URL-safe identifier  (also the HTML filename stem)
 *   en    – { title }   English title
 *   ko/ja/fr/ru/es – { title } translated title, or null if not yet translated
 *
 * URL convention:
 *   Korean articles live at  articles/{slug}.html  (this site)
 *   Other languages live at  https://chinese.law/[lang/]articles/{slug}.html
 */

var ARTICLES_DATA = [
  {
    "date": "2026-10-15",
    "slug": "tax-treatment-of-china-property-allocated-to-one-spouse-after-korea-china-cross-border-divorce",
    "src": "divorce-property",
    "tags": [
      "한중 국제이혼",
      "중국 부동산 재산분할",
      "이혼 재산분할 세금",
      "중국 주택 계세 면제",
      "이혼 후 부동산 명의 이전",
      "중국 부동산 양도소득세",
      "外籍离婚房产",
      "离婚析产 契税",
      "China divorce property tax"
    ],
    "en": {
      "title": "Tax Treatment When a Property in China Is Allocated to One Spouse After a Korea–China Cross-Border Divorce"
    },
    "ko": {
      "title": "한·중 국제이혼 후 중국 소재 부동산을 일방에게 귀속시키는 경우의 세무 처리"
    },
    "ja": null,
    "fr": null,
    "ru": null,
    "es": null
  },
  {
    "date": "2026-10-15",
    "slug": "korean-father-zero-price-transfer-of-chinese-company-equity-to-child-tax-analysis",
    "src": "equity-gift",
    "tags": [
      "중국 법인 지분 증여",
      "0원 양도",
      "한국 증여세",
      "중국 개인소득세",
      "국외재산 증여",
      "해외직접투자 신고",
      "한중 세무",
      "股权0元转让",
      "近亲属股权转让",
      "67号公告",
      "China equity gift tax Korea"
    ],
    "en": {
      "title": "Tax Analysis of a Korean Father's Zero-Price Transfer of a Chinese Company's Equity to His Child (China and Korea)"
    },
    "ko": {
      "title": "한국인 부친이 중국 법인 지분을 자녀에게 0원에 양도하는 경우의 한·중 세무 분석"
    },
    "ja": null,
    "fr": null,
    "ru": null,
    "es": null
  },
  {
    "date": "2026-10-14",
    "slug": "acceleration-of-shareholder-capital-contributions-in-chinese-companies-part-3-creditor-remedies-and-strategies-for-korean-companies",
    "tags": [
      "중국 채권자 권리행사",
      "집행절차 주주 추가",
      "집행이의의 소",
      "파산",
      "법인격부인",
      "종본재정",
      "중국 회사법",
      "신회사법 제54조",
      "출자기한 도래 가속",
      "인수제",
      "주주 출자",
      "중국 채권 회수",
      "한국 기업",
      "加速到期",
      "认缴出资",
      "China Company Law"
    ],
    "en": {
      "title": "Acceleration of Shareholder Capital Contributions in Chinese Companies (3): Practical Advice — Four Enforcement Routes for Creditors and Response Strategies for Korean Companies"
    },
    "ko": {
      "title": "중국 회사 주주출자 기한도래 가속 제도 (3): 실무 제언 — 채권자의 네 가지 권리행사 경로와 한국 기업의 대응 전략"
    },
    "ja": null,
    "fr": null,
    "ru": null,
    "es": null
  },
  {
    "date": "2026-10-07",
    "slug": "acceleration-of-shareholder-capital-contributions-in-chinese-companies-part-2-article-54-of-the-new-company-law",
    "tags": [
      "회사법 제54조 해석",
      "출자 조기 납입",
      "시간적 효력",
      "불능변제",
      "公司法第54条",
      "중국 회사법",
      "신회사법 제54조",
      "출자기한 도래 가속",
      "인수제",
      "주주 출자",
      "중국 채권 회수",
      "한국 기업",
      "加速到期",
      "认缴出资",
      "China Company Law"
    ],
    "en": {
      "title": "Acceleration of Shareholder Capital Contributions in Chinese Companies (2): Legal Interpretation — History, Requirements and Temporal Effect of Article 54 of the New Company Law"
    },
    "ko": {
      "title": "중국 회사 주주출자 기한도래 가속 제도 (2): 법률 해석 — 「신회사법」 제54조의 연혁, 요건 및 시간적 효력"
    },
    "ja": null,
    "fr": null,
    "ru": null,
    "es": null
  },
  {
    "date": "2026-09-30",
    "slug": "acceleration-of-shareholder-capital-contributions-in-chinese-companies-part-1-why-the-issue-exists",
    "tags": [
      "한중 회사 자본제도 비교",
      "납입자본",
      "인수약정자본",
      "전액납입주의",
      "注册资本",
      "중국 회사법",
      "신회사법 제54조",
      "출자기한 도래 가속",
      "인수제",
      "주주 출자",
      "중국 채권 회수",
      "한국 기업",
      "加速到期",
      "认缴出资",
      "China Company Law"
    ],
    "en": {
      "title": "Acceleration of Shareholder Capital Contributions in Chinese Companies (1): Why the Issue Exists — From Paid-in Capital to Subscribed Capital"
    },
    "ko": {
      "title": "중국 회사 주주출자 기한도래 가속 제도 (1): 문제는 왜 존재하는가 — '납입자본'에서 '인수약정자본'으로"
    },
    "ja": null,
    "fr": null,
    "ru": null,
    "es": null
  },
  {
    "date": "2026-05-23",
    "slug": "chinas-legal-framework-for-exit-restrictions-on-foreign-nationals",
    "tags": [
      "China law",
      "exit restrictions",
      "foreign nationals",
      "civil enforcement",
      "criminal procedure",
      "immigration",
      "supervisory investigation"
    ],
    "en": {
      "title": "China's Legal Framework for Exit Restrictions on Foreign Nationals"
    },
    "ko": {
      "title": "중국의 외국인 출국제한 법률제도"
    },
    "ja": {
      "title": "中国における外国人の出国制限法律制度"
    },
    "fr": {
      "title": "Le régime juridique chinois de restriction de sortie du territoire pour les ressortissants étrangers"
    },
    "ru": {
      "title": "Правовой режим ограничения выезда иностранных граждан из Китая"
    },
    "es": {
      "title": "El régimen jurídico chino de restricción de salida del territorio para extranjeros"
    }
  },
  {
    "date": "2026-04-28",
    "slug": "can-secret-recordings-be-used-as-evidence-in-chinese-litigation",
    "tags": [
      "China law",
      "evidence",
      "litigation",
      "secret recordings",
      "civil procedure",
      "admissibility"
    ],
    "en": {
      "title": "Can Secret Recordings Be Used as Evidence in Chinese Litigation?"
    },
    "ko": {
      "title": "중국에서 몰래 한 녹음·녹화, 소송 증거로 쓸 수 있을까?"
    },
    "ja": {
      "title": "中国における秘密録音・録画は訴訟証拠として認められるか"
    },
    "fr": {
      "title": "Les enregistrements secrets peuvent-ils être utilisés comme preuves devant les tribunaux en Chine ?"
    },
    "ru": {
      "title": "Могут ли тайные аудио- и видеозаписи служить доказательством в суде в Китае?"
    },
    "es": {
      "title": "¿Pueden utilizarse como prueba judicial en China las grabaciones secretas?"
    }
  },
  {
    "date": "2026-04-17",
    "slug": "division-of-property-in-china-after-a-court-divorce-obtained-by-a-foreign-couple",
    "tags": [
      "China law",
      "divorce",
      "property division",
      "foreign nationals",
      "family law",
      "cross-border"
    ],
    "en": {
      "title": "Division of Property in China After a Court Divorce Obtained by a Foreign Couple"
    },
    "ko": {
      "title": "외국 국적 부부의 소송 이혼 후 중국 내 재산 분할 처리"
    },
    "ja": {
      "title": "外国籍夫婦が訴訟離婚した後の中国国内財産分割の取り扱い"
    },
    "fr": {
      "title": "Traitement du partage des biens situés en Chine après le divorce judiciaire d'un couple étranger"
    },
    "ru": {
      "title": "Раздел имущества в Китае после расторжения брака иностранными гражданами в судебном порядке"
    },
    "es": {
      "title": "Tratamiento de la división de bienes en China tras el divorcio judicial de un matrimonio extranjero"
    }
  },
  {
    "date": "2026-03-11",
    "slug": "website-test-notice-and-upcoming-content-preview",
    "en": {
      "title": "Website Test Notice and Upcoming Content Preview"
    },
    "ko": {
      "title": "웹사이트 테스트 공지 및 예정 콘텐츠 미리보기"
    },
    "ja": {
      "title": "ウェブサイトテストのお知らせおよび今後のコンテンツ予告"
    },
    "fr": {
      "title": "Avis de test du site Web et aperçu des contenus à venir"
    },
    "ru": {
      "title": "Уведомление о тестировании веб-сайта и анонс предстоящих материалов"
    },
    "es": {
      "title": "Aviso de prueba del sitio web y adelanto del contenido próximo"
    }
  }
];

/**
 * LANG_META – display labels and URL paths for each language.
 * ko is the current site; others link to chinese.law.
 */
var LANG_META = {
  en: { label: "EN", name: "English",  homeUrl: "https://chinese.law/",    pubsUrl: "https://chinese.law/publications.html" },
  ko: { label: "KR", name: "한국어",    homeUrl: "/index.html",             pubsUrl: "/publications.html" },
  ja: { label: "JP", name: "日本語",    homeUrl: "https://chinese.law/ja/", pubsUrl: "https://chinese.law/ja/publications.html" },
  fr: { label: "FR", name: "Français",  homeUrl: "https://chinese.law/fr/", pubsUrl: "https://chinese.law/fr/publications.html" },
  ru: { label: "RU", name: "Русский",   homeUrl: "https://chinese.law/ru/", pubsUrl: "https://chinese.law/ru/publications.html" },
  es: { label: "ES", name: "Español",   homeUrl: "https://chinese.law/es/", pubsUrl: "https://chinese.law/es/publications.html" },
};
